import { Op } from 'sequelize';
import { Review, Application, Worker, FraudAlert } from '../models/index.js';

/**
 * Checks if a homeowner is posting identical, repetitive reviews.
 */
export const checkSpamReviews = async (fromId, text) => {
  try {
    const cleanText = text.trim().toLowerCase();
    if (cleanText.length < 5) return;

    // Find other reviews by this user in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReviews = await Review.findAll({
      where: {
        fromId,
        createdAt: { [Op.gte]: oneHourAgo }
      }
    });

    // Check for exact matching text
    const exactMatches = recentReviews.filter(r => r.text.trim().toLowerCase() === cleanText);
    
    if (exactMatches.length >= 3) {
      await FraudAlert.create({
        type: 'spam_reviews',
        severity: 'medium',
        status: 'open',
        targetUser: fromId,
        details: `User submitted identical review text "${text}" to ${exactMatches.length + 1} different workers within an hour.`,
        metadata: { duplicateCount: exactMatches.length + 1, reviewText: text }
      });
      console.warn(`[FRAUD ALERT] Spam reviews detected for user: ${fromId}`);
    }
  } catch (error) {
    console.error('Error in checkSpamReviews:', error);
  }
};

/**
 * Checks if a worker is spamming job applications (e.g. > 5 apps in 5 mins).
 */
export const checkApplicationSpam = async (workerId, userId) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentAppCount = await Application.count({
      where: {
        workerId,
        createdAt: { [Op.gte]: fiveMinutesAgo }
      }
    });

    if (recentAppCount >= 5) {
      await FraudAlert.create({
        type: 'application_spam',
        severity: 'high',
        status: 'open',
        targetUser: userId,
        details: `Worker submitted ${recentAppCount} job applications in under 5 minutes.`,
        metadata: { applicationCount: recentAppCount, workerId }
      });
      console.warn(`[FRAUD ALERT] Application spam detected for worker: ${workerId}`);
    }
  } catch (error) {
    console.error('Error in checkApplicationSpam:', error);
  }
};

/**
 * Checks if a worker profile duplicates another worker profile's headline & skills.
 */
export const checkDuplicateProfile = async (workerId, userId, headline, skills) => {
  try {
    const cleanHeadline = headline.trim().toLowerCase();
    const skillsString = [...skills].sort().join(',').toLowerCase();

    // Find other workers
    const workers = await Worker.findAll({ 
      where: { 
        id: { [Op.ne]: workerId }, 
        isDeleted: false 
      } 
    });

    for (const other of workers) {
      const otherHeadline = other.headline.trim().toLowerCase();
      const otherSkillsString = [...other.skills].sort().join(',').toLowerCase();

      // Check if both headline and skills are identical
      if (otherHeadline === cleanHeadline && otherSkillsString === skillsString) {
        await FraudAlert.create({
          type: 'duplicate_profile',
          severity: 'low',
          status: 'open',
          targetUser: userId,
          details: `Worker profile has an identical headline and set of skills as worker ${other.id}. Possible duplicate account.`,
          metadata: { duplicateWorkerId: other.id, headline, skills }
        });
        console.warn(`[FRAUD ALERT] Duplicate profile detected for worker: ${workerId}`);
        break;
      }
    }
  } catch (error) {
    console.error('Error in checkDuplicateProfile:', error);
  }
};
