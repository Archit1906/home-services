import express from 'express';
import { Op } from 'sequelize';
import { Worker, User, Review, Job, Application } from '../models/index.js';
import { protect, requireRole } from '../middleware/auth.js';
import { summarizeReviews } from '../services/geminiService.js';
import { checkDuplicateProfile } from '../services/fraudDetectionService.js';

const router = express.Router();

/**
 * @route   GET /api/workers
 * @desc    Retrieve list of workers based on filters
 */
router.get('/', async (req, res, next) => {
  try {
    const { skills, minExperience, verificationStatus, city } = req.query;

    let whereClause = { isDeleted: false };
    let userWhereClause = {};

    if (minExperience) {
      whereClause.experience = { [Op.gte]: Number(minExperience) };
    }

    if (verificationStatus) {
      whereClause.verificationStatus = verificationStatus;
    }

    if (city) {
      userWhereClause.city = { [Op.like]: `%${city}%` };
    }

    let workers = await Worker.findAll({
      where: whereClause,
      include: [{ 
        model: User, 
        as: 'user', 
        where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
        attributes: ['name', 'photoURL', 'city', 'email', 'phone'] 
      }],
      order: [['updatedAt', 'DESC']]
    });

    // In-memory filter for JSON skills array to ensure dialect-agnostic compatibility
    if (skills && workers.length > 0) {
      const filterSkills = skills.split(',').map(s => s.trim().toLowerCase());
      workers = workers.filter(worker => {
        let workerSkills = worker.skills || [];
        if (typeof workerSkills === 'string') {
          try {
            workerSkills = JSON.parse(workerSkills);
          } catch (e) {
            workerSkills = [];
          }
        }
        return workerSkills && Array.isArray(workerSkills) && workerSkills.some(skill => 
          filterSkills.some(fs => skill.toLowerCase().includes(fs))
        );
      });
    }

    return res.json({ success: true, count: workers.length, workers });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/workers/profile/applications
 * @desc    Retrieve list of applications submitted by the logged in worker
 */
router.get('/profile/applications', protect, requireRole('worker'), async (req, res, next) => {
  try {
    if (!req.worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const applications = await Application.findAll({
      where: { workerId: req.worker.id, isDeleted: false },
      include: [
        {
          model: Job,
          as: 'job',
          where: { isDeleted: false },
          include: [{ model: User, as: 'user', attributes: ['name', 'phone', 'city', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/workers/:id
 * @desc    Get worker profile details with review summary
 */
router.get('/:id', async (req, res, next) => {
  try {
    const worker = await Worker.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'photoURL', 'city', 'email', 'phone'] }]
    });

    if (!worker || worker.isDeleted) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    // Fetch reviews
    const reviews = await Review.findAll({
      where: { toId: worker.id, isDeleted: false },
      include: [{ model: User, as: 'reviewer', attributes: ['name', 'photoURL'] }],
      order: [['createdAt', 'DESC']]
    });

    // Generate AI review summary if cache is empty or older than 7 days
    let summaryText = worker.aiReviewSummary?.text || '';
    const lastGenerated = worker.aiReviewSummary?.generatedAt;
    const shouldRegenerate = !summaryText || !lastGenerated || (Date.now() - new Date(lastGenerated).getTime() > 7 * 24 * 60 * 60 * 1000);

    if (reviews.length > 0 && shouldRegenerate) {
      try {
        const reviewsDataForAI = reviews.map(r => ({
          rating: r.rating,
          text: r.text
        }));
        const result = await summarizeReviews(reviewsDataForAI);
        summaryText = result.summary;
        
        worker.aiReviewSummary = {
          text: summaryText,
          generatedAt: new Date()
        };
        await worker.save();
      } catch (err) {
        console.error('Failed to generate AI review summary:', err);
      }
    }

    return res.json({
      success: true,
      worker,
      reviews,
      aiSummary: summaryText
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/workers/profile
 * @desc    Update worker profile (headline, skills, portfolio, availability)
 */
router.put('/profile', protect, requireRole('worker'), async (req, res, next) => {
  try {
    const { headline, skills, experience, languages, availabilityCalendar, portfolio } = req.body;

    if (!req.worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const worker = req.worker;

    // Apply updates
    if (headline) worker.headline = headline;
    if (skills) worker.skills = skills;
    if (experience !== undefined) worker.experience = Number(experience);
    if (languages) worker.languages = languages;
    if (availabilityCalendar) worker.availabilityCalendar = availabilityCalendar;
    if (portfolio) worker.portfolio = portfolio;

    await worker.save();

    // Trigger fraud duplicate profile check in background
    if (headline && skills) {
      checkDuplicateProfile(worker.id, req.user.id, headline, skills);
    }

    return res.json({
      success: true,
      message: 'Worker profile updated successfully',
      worker
    });
  } catch (error) {
    next(error);
  }
});

export default router;
