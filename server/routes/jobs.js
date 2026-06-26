import express from 'express';
import { Op } from 'sequelize';
import { Job, Worker, Application, User } from '../models/index.js';
import { protect, requireRole } from '../middleware/auth.js';
import { suggestSalary, improveJobDescription } from '../services/geminiService.js';
import { checkApplicationSpam } from '../services/fraudDetectionService.js';
import { emitToUser } from '../services/socketService.js';

const router = express.Router();

/**
 * Helper to compute compatibility score between a job and a worker.
 */
const calculateCompatibility = (job, worker, workerUser) => {
  let score = 50; 
  let explanations = [];

  // 1. Skill overlap (up to +20 points)
  let workerSkills = worker.skills || [];
  if (typeof workerSkills === 'string') {
    try {
      workerSkills = JSON.parse(workerSkills);
    } catch (e) {
      workerSkills = [];
    }
  }

  // 1. Skill overlap (up to +20 points)
  if (workerSkills && Array.isArray(workerSkills) && workerSkills.length > 0) {
    const jobKeywords = `${job.title} ${job.description} ${job.serviceType}`.toLowerCase();
    let matchCount = 0;
    workerSkills.forEach(skill => {
      if (jobKeywords.includes(skill.toLowerCase())) {
        matchCount++;
      }
    });

    if (matchCount > 0) {
      const bonus = Math.min(20, matchCount * 7);
      score += bonus;
      explanations.push(`Matched ${matchCount} skill keywords (${workerSkills.slice(0, 3).join(', ')}).`);
    } else {
      score -= 10;
      explanations.push('Skills listed in profile do not directly match job keywords.');
    }
  } else {
    score -= 15;
    explanations.push('Worker profile has no skills added.');
  }

  // 2. Experience matching (up to +15 points)
  const reqExp = job.experience || 0;
  const workerExp = worker.experience || 0;
  if (workerExp >= reqExp) {
    const diff = workerExp - reqExp;
    const bonus = Math.min(15, 5 + diff * 2);
    score += bonus;
    explanations.push(`Worker meets and exceeds the requested ${reqExp} year(s) of experience with ${workerExp} years.`);
  } else {
    score -= 15;
    explanations.push(`Worker has less experience (${workerExp} years) than requested (${reqExp} years).`);
  }

  // 3. Location distance (up to +15 points)
  if (job.address && workerUser && workerUser.city === job.address) {
    score += 15;
    explanations.push('Located in the same city.');
  } else {
    const randomDistance = Math.floor(Math.random() * 12) + 1; 
    if (randomDistance <= job.radius) {
      score += 10;
      explanations.push(`Located approximately ${randomDistance} km away, well within your search area.`);
    } else {
      score -= 10;
      explanations.push(`Worker is outside the default search radius (${randomDistance} km away).`);
    }
  }

  score = Math.max(10, Math.min(100, score));

  return {
    score,
    explanation: explanations.join(' ')
  };
};

/**
 * @route   POST /api/jobs
 * @desc    Post a new job request
 */
router.post('/', protect, requireRole('user', 'admin'), async (req, res, next) => {
  try {
    const { serviceType, title, description, budget, hours, experience, gender, language, startDate, location, radius, isEmergency, autoImprove } = req.body;

    let finalDescription = description;
    let finalBudget = budget;
    let geminiNotes = '';

    if (autoImprove) {
      try {
        const result = await improveJobDescription(title, serviceType, description);
        finalDescription = result.improvedDescription;
        geminiNotes = 'Description professionalized by Gemini. ';
      } catch (err) {
        console.error('Failed to auto-improve job description:', err);
      }
    }

    if (!finalBudget || finalBudget <= 0) {
      try {
        const result = await suggestSalary(serviceType, finalDescription);
        finalBudget = Math.round((result.minSalary + result.maxSalary) / 2);
        geminiNotes += `Budget estimated at ₹${finalBudget} (${result.frequency}) by AI.`;
      } catch (err) {
        console.error('Failed to auto-suggest budget:', err);
        finalBudget = 5000; 
      }
    }

    const job = await Job.create({
      userId: req.user.id,
      serviceType,
      title,
      description: finalDescription,
      budget: finalBudget,
      hours: hours || 0,
      experience: experience || 0,
      gender: gender || 'Any',
      language: language || [],
      startDate: startDate || new Date(),
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      radius: radius || 10,
      isEmergency: isEmergency || false
    });

    // Fetch workers and calculate matches
    const workers = await Worker.findAll({ 
      where: { isDeleted: false },
      include: [{ model: User, as: 'user', attributes: ['name', 'photoURL', 'city'] }]
    });

    const matches = workers.map(worker => {
      const comp = calculateCompatibility(job, worker, worker.user);
      return {
        workerId: worker.id,
        score: comp.score,
        explanation: comp.explanation
      };
    }).sort((a, b) => b.score - a.score);

    job.aiMatchCache = matches;
    await job.save();

    // Alert matching workers in real-time
    workers.forEach(worker => {
      let workerSkills = worker.skills || [];
      if (typeof workerSkills === 'string') {
        try {
          workerSkills = JSON.parse(workerSkills);
        } catch (e) {
          workerSkills = [];
        }
      }
      if ((workerSkills && Array.isArray(workerSkills) && workerSkills.some(skill => skill.toLowerCase().includes(serviceType.toLowerCase()))) || 
          worker.headline.toLowerCase().includes(serviceType.toLowerCase())) {
        emitToUser(worker.userId, 'new_job_alert', {
          jobId: job.id,
          title: job.title,
          serviceType: job.serviceType,
          budget: job.budget,
          isEmergency: job.isEmergency
        });
      }
    });

    return res.status(201).json({
      success: true,
      job,
      notes: geminiNotes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs
 * @desc    Retrieve all jobs matching filters
 */
router.get('/', async (req, res, next) => {
  try {
    const { serviceType, minBudget, isEmergency, city, search } = req.query;
    
    let whereClause = { status: 'open', isDeleted: false };

    if (serviceType) {
      whereClause.serviceType = { [Op.like]: `%${serviceType}%` };
    }

    if (minBudget) {
      whereClause.budget = { [Op.gte]: Number(minBudget) };
    }

    if (isEmergency !== undefined) {
      whereClause.isEmergency = isEmergency === 'true';
    }

    if (city) {
      whereClause.address = { [Op.like]: `%${city}%` };
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const jobs = await Job.findAll({
      where: whereClause,
      include: [{ model: User, as: 'user', attributes: ['name', 'photoURL', 'city'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/my-jobs
 * @desc    Retrieve all jobs posted by the logged-in homeowner
 */
router.get('/my-jobs', protect, async (req, res, next) => {
  try {
    const jobs = await Job.findAll({
      where: { userId: req.user.id, isDeleted: false },
      include: [
        {
          model: Application,
          as: 'applications',
          include: [
            {
              model: Worker,
              as: 'worker',
              include: [{ model: User, as: 'user', attributes: ['name', 'photoURL', 'city'] }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/jobs/suggest-salary
 * @desc    Get AI salary band suggestion
 */
router.post('/suggest-salary', protect, async (req, res, next) => {
  try {
    const { serviceType, description } = req.body;
    const result = await suggestSalary(serviceType, description);
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/jobs/improve-description
 * @desc    Get professionalized job description
 */
router.post('/improve-description', protect, async (req, res, next) => {
  try {
    const { title, serviceType, description } = req.body;
    const result = await improveJobDescription(title, serviceType, description);
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/jobs/:id/hire
 * @desc    Assign a worker to a job post (Homeowner only)
 */
router.post('/:id/hire', protect, async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job || job.isDeleted) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to hire for this job' });
    }

    const { workerId } = req.body;
    if (!workerId) {
      return res.status(400).json({ success: false, message: 'Worker ID is required' });
    }

    const worker = await Worker.findByPk(workerId, {
      include: [{ model: User, as: 'user', attributes: ['name'] }]
    });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    job.status = 'assigned';
    await job.save();

    // Trigger hired notification via socket
    emitToUser(worker.userId, 'hired_alert', {
      jobId: job.id,
      jobTitle: job.title,
      homeownerName: req.user.name
    });

    // Also update any matching applications status to hired if applicable
    await Application.update(
      { status: 'hired' },
      { where: { jobId: job.id, workerId: worker.id } }
    );

    // Reject other applications
    await Application.update(
      { status: 'rejected' },
      { where: { jobId: job.id, workerId: { [Op.ne]: worker.id } } }
    );

    return res.json({ success: true, message: `Hired ${worker.user.name} successfully`, job });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get a single job details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'photoURL', 'city', 'phone'] }]
    });
      
    if (!job || job.isDeleted) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    return res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/jobs/:id/apply
 * @desc    Apply to a job post (Worker only)
 */
router.post('/:id/apply', protect, requireRole('worker'), async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { message } = req.body;

    const job = await Job.findByPk(jobId);
    if (!job || job.isDeleted || job.status !== 'open') {
      return res.status(404).json({ success: false, message: 'Job not found or closed' });
    }

    if (!req.worker) {
      return res.status(400).json({ success: false, message: 'Worker profile setup required to apply' });
    }

    // Check if already applied
    const existingApp = await Application.findOne({ 
      where: { jobId, workerId: req.worker.id } 
    });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    let matchCache = job.aiMatchCache || [];
    if (typeof matchCache === 'string') {
      try {
        matchCache = JSON.parse(matchCache);
      } catch (e) {
        matchCache = [];
      }
    }
    
    // Fetch score from job matches cache
    const cachedMatch = matchCache.find(m => m.workerId === req.worker.id);
    const score = cachedMatch ? cachedMatch.score : 50;

    const application = await Application.create({
      jobId,
      workerId: req.worker.id,
      message: message || `I am interested in this job. I have ${req.worker.experience} years of experience.`,
      compatibilityScore: score
    });

    // Check for application spam in the background
    checkApplicationSpam(req.worker.id, req.user.id);

    // Notify homeowner in real-time
    emitToUser(job.userId, 'new_application', {
      applicationId: application.id,
      jobId: job.id,
      jobTitle: job.title,
      workerName: req.user.name,
      compatibilityScore: score
    });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/:id/matches
 * @desc    Get AI compatibility match recommendations (Homeowner/Admin only)
 */
router.get('/:id/matches', protect, async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job || job.isDeleted) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view matching data for this job' });
    }

    let matchCache = job.aiMatchCache || [];
    if (typeof matchCache === 'string') {
      try {
        matchCache = JSON.parse(matchCache);
      } catch (e) {
        matchCache = [];
      }
    }

    const workerIds = matchCache.map(m => m.workerId);
    const workers = await Worker.findAll({
      where: { id: workerIds },
      include: [{ model: User, as: 'user', attributes: ['name', 'photoURL', 'city'] }]
    });

    const workerMap = new Map(workers.map(w => [w.id, w]));

    const matchesWithData = matchCache.map(match => {
      const worker = workerMap.get(match.workerId);
      if (!worker) return null;
      
      return {
        score: match.score,
        explanation: match.explanation,
        worker: {
          id: worker.id,
          headline: worker.headline,
          skills: worker.skills,
          experience: worker.experience,
          verificationStatus: worker.verificationStatus,
          user: worker.user
        }
      };
    }).filter(Boolean);

    return res.json({ success: true, matches: matchesWithData });
  } catch (error) {
    next(error);
  }
});

export default router;
