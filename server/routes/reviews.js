import express from 'express';
import { Review, Job, Worker } from '../models/index.js';
import { protect } from '../middleware/auth.js';
import { checkSpamReviews } from '../services/fraudDetectionService.js';
import { emitToUser } from '../services/socketService.js';

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a worker
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { toId, jobId, rating, text } = req.body;

    if (!toId || !jobId || !rating || !text) {
      return res.status(400).json({ success: false, message: 'All fields (toId, jobId, rating, text) are required' });
    }

    // Verify job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if homeowner is the posting user
    if (job.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the job owner can review this work' });
    }

    // Verify worker exists
    const worker = await Worker.findByPk(toId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ 
      where: { fromId: req.user.id, toId, jobId } 
    });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this worker for this job' });
    }

    // Create review
    const review = await Review.create({
      fromId: req.user.id,
      toId,
      jobId,
      rating: Number(rating),
      text
    });

    // Check for spam reviews in the background
    checkSpamReviews(req.user.id, text);

    // Notify the worker in real-time
    emitToUser(worker.userId, 'new_review', {
      reviewId: review.id,
      rating: review.rating,
      reviewerName: req.user.name
    });

    return res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/reviews/:id/reply
 * @desc    Worker reply to a review
 */
router.post('/:id/reply', protect, async (req, res, next) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const review = await Review.findByPk(req.params.id);
    if (!review || review.isDeleted) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if current user is the worker being reviewed
    if (!req.worker || review.toId !== req.worker.id) {
      return res.status(403).json({ success: false, message: 'You can only reply to reviews written for you' });
    }

    review.ownerResponse = reply;
    await review.save();

    // Notify homeowner in real-time
    emitToUser(review.fromId, 'review_reply', {
      reviewId: review.id,
      reply
    });

    return res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

export default router;
