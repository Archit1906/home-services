import express from 'express';
import { User, Worker, Job, Verification, FraudAlert } from '../models/index.js';
import { protect, requireRole } from '../middleware/auth.js';
import { emitToUser } from '../services/socketService.js';

const router = express.Router();

// Enforce admin check
router.use(protect);
router.use(requireRole('admin'));

/**
 * @route   GET /api/admin/stats
 * @desc    Retrieve metrics statistics for admin dashboard
 */
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.count({ where: { isDeleted: false } });
    const userRoleCount = await User.count({ where: { role: 'user', isDeleted: false } });
    const workerRoleCount = await User.count({ where: { role: 'worker', isDeleted: false } });
    
    const totalJobs = await Job.count({ where: { isDeleted: false } });
    const openJobs = await Job.count({ where: { status: 'open', isDeleted: false } });
    const assignedJobs = await Job.count({ where: { status: 'assigned', isDeleted: false } });
    
    const totalVerifications = await Verification.count();
    const pendingVerifications = await Verification.count({ where: { status: 'pending' } });
    
    const openFraudAlerts = await FraudAlert.count({ where: { status: 'open' } });
    const totalFraudAlerts = await FraudAlert.count();

    return res.json({
      success: true,
      stats: {
        users: { total: totalUsers, homeowners: userRoleCount, workers: workerRoleCount },
        jobs: { total: totalJobs, open: openJobs, assigned: assignedJobs },
        verifications: { total: totalVerifications, pending: pendingVerifications },
        fraud: { total: totalFraudAlerts, open: openFraudAlerts }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/verifications
 * @desc    Get verification requests queue
 */
router.get('/verifications', async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const verifications = await Verification.findAll({
      where: query,
      include: [
        {
          model: Worker,
          as: 'worker',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'photoURL', 'city'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, count: verifications.length, verifications });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/verifications/:id/verify
 * @desc    Approve or reject a worker verification request
 */
router.post('/verifications/:id/verify', async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status (must be verified or rejected)' });
    }

    const verification = await Verification.findByPk(req.params.id);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    verification.status = status;
    verification.rejectionReason = status === 'rejected' ? (rejectionReason || 'Documents mismatch') : '';
    verification.reviewedBy = req.user.id;
    verification.reviewedAt = new Date();
    await verification.save();

    // Update Worker document verification state
    const worker = await Worker.findByPk(verification.workerId);
    if (worker) {
      worker.verificationStatus = status;
      await worker.save();

      // Emit verification alert to worker in real-time
      emitToUser(worker.userId, 'verification_status', {
        status,
        rejectionReason: verification.rejectionReason
      });
    }

    return res.json({ success: true, message: `Worker verification status set to ${status}`, verification });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/fraud
 * @desc    Get fraud alerts list
 */
router.get('/fraud', async (req, res, next) => {
  try {
    const { status, type } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const alerts = await FraudAlert.findAll({
      where: query,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'role', 'city'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/fraud/:id/resolve
 * @desc    Resolve or dismiss a fraud alert
 */
router.post('/fraud/:id/resolve', async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status (must be resolved or dismissed)' });
    }

    const alert = await FraudAlert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Fraud alert not found' });
    }

    alert.status = status;
    alert.resolutionNotes = resolutionNotes || '';
    alert.resolvedBy = req.user.id;
    alert.resolvedAt = new Date();
    await alert.save();

    return res.json({ success: true, message: `Fraud alert status updated to ${status}`, alert });
  } catch (error) {
    next(error);
  }
});

export default router;
