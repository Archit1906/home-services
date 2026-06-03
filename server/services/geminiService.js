import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper to extract JSON from Gemini text response
const parseJSONResponse = (text) => {
  try {
    // Look for markdown code block tags if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('Failed to parse JSON response from Gemini, raw text:', text);
    throw new Error('Invalid JSON format from AI model');
  }
};

/**
 * Suggests salary band in INR based on service type and details.
 */
export const suggestSalary = async (serviceType, description) => {
  const type = (serviceType || '').toLowerCase();
  
  if (!genAI) {
    return getMockSalary(type, description);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert AI salary estimator for neighborhood household service jobs in Indian cities.
      Suggest a reasonable monthly or hourly salary in INR (Indian Rupees) for a "${serviceType}" based on this job description: "${description}".
      
      Respond strictly in JSON format matching the following schema:
      {
        "minSalary": number,
        "maxSalary": number,
        "frequency": "monthly" | "hourly" | "per_visit",
        "explanation": "string explaining how this salary was derived based on typical rates in India and specific requirements"
      }
      Do not output any markdown other than the JSON block.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini API call failed for suggestSalary, running fallback:', error);
    return getMockSalary(type, description);
  }
};

/**
 * Professionalizes a basic job description.
 */
export const improveJobDescription = async (title, serviceType, description) => {
  if (!genAI) {
    return getMockImprovedDescription(title, serviceType, description);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are a professional copywriter for neighborhood services.
      Improve the following job posting description for a household service. Make it polite, clear, and professional.
      Title: "${title}"
      Service Type: "${serviceType}"
      Original description: "${description}"

      Respond strictly in JSON format matching the following schema:
      {
        "improvedDescription": "a beautiful multi-paragraph professional description",
        "keyResponsibilities": ["responsibility 1", "responsibility 2", ...],
        "requiredSkills": ["skill 1", "skill 2", ...]
      }
      Do not output any markdown other than the JSON block.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini API call failed for improveJobDescription, running fallback:', error);
    return getMockImprovedDescription(title, serviceType, description);
  }
};

/**
 * Summarizes reviews of a worker into a short, impactful paragraph.
 */
export const summarizeReviews = async (reviews) => {
  if (!reviews || reviews.length === 0) {
    return { summary: 'No reviews available yet to summarize.' };
  }

  const reviewTexts = reviews.map(r => `Rating: ${r.rating} stars - "${r.text}"`).join('\n');

  if (!genAI) {
    return getMockReviewSummary(reviews);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an AI profile summarizer.
      Summarize the following reviews for a local service worker in a concise, professional 1-2 sentence overview of their strengths and common praise.
      
      Reviews list:
      ${reviewTexts}

      Respond strictly in JSON format matching the following schema:
      {
        "summary": "concise 1-2 sentence review summary"
      }
      Do not output any markdown other than the JSON block.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini API call failed for summarizeReviews, running fallback:', error);
    return getMockReviewSummary(reviews);
  }
};

// ==========================================
// RULE-BASED FALLBACK MOCK ENGINES
// ==========================================

function getMockSalary(type, description) {
  const desc = (description || '').toLowerCase();
  let minSalary = 5000;
  let maxSalary = 9000;
  let frequency = 'monthly';
  let explanation = '';

  const isFullTime = desc.includes('full time') || desc.includes('full-time') || desc.includes('24 hours') || desc.includes('live in') || desc.includes('live-in');
  const isPartTime = desc.includes('part time') || desc.includes('part-time') || desc.includes('hours a day') || desc.includes('hourly');
  const isUrgent = desc.includes('urgent') || desc.includes('immediately') || desc.includes('emergency');

  // Base rates for service types
  if (type.includes('maid')) {
    minSalary = 6000; maxSalary = 10000; frequency = 'monthly';
    explanation = 'Based on typical domestic help rates in Indian metro cities for cleaning, dusting, and general maintenance.';
  } else if (type.includes('cook')) {
    minSalary = 7000; maxSalary = 12000; frequency = 'monthly';
    explanation = 'Derived from typical home chef salaries, considering meal frequency, household count, and culinary requirements.';
  } else if (type.includes('plumber') || type.includes('electrician') || type.includes('carpenter') || type.includes('ac technician')) {
    minSalary = 350; maxSalary = 750; frequency = 'per_visit';
    explanation = 'Calculated standard service visitation charge in India, excluding parts and structural replacements.';
  } else if (type.includes('driver')) {
    minSalary = 16000; maxSalary = 24000; frequency = 'monthly';
    explanation = 'Standard commercial or private chauffeur salary in tier-1 Indian cities, based on an 8 to 10-hour shift.';
  } else if (type.includes('caretaker')) {
    minSalary = 15000; maxSalary = 25000; frequency = 'monthly';
    explanation = 'Reflects specialized patient or elderly assistance needing basic nursing, medication monitoring, and daily support.';
  } else if (type.includes('tutor')) {
    minSalary = 4000; maxSalary = 10000; frequency = 'monthly';
    explanation = 'Based on custom home academic assistance rates, assuming 3 to 5 weekly sessions.';
  } else if (type.includes('gardener')) {
    minSalary = 3000; maxSalary = 6000; frequency = 'monthly';
    explanation = 'Based on periodic gardening/landscaping visits (2-3 times per week).';
  } else if (type.includes('painter')) {
    minSalary = 12000; maxSalary = 20000; frequency = 'monthly';
    explanation = 'Calculated based on standard contract wall painting helper salaries.';
  } else {
    minSalary = 5000; maxSalary = 8000; frequency = 'monthly';
    explanation = 'General service provider average rate for domestic neighborhood duties.';
  }

  // Adjustments based on descriptions
  if (frequency === 'monthly') {
    if (isFullTime) {
      minSalary = Math.round(minSalary * 1.8);
      maxSalary = Math.round(maxSalary * 1.8);
      explanation += ' Elevated due to full-time/live-in requirements.';
    } else if (isPartTime) {
      minSalary = Math.round(minSalary * 0.6);
      maxSalary = Math.round(maxSalary * 0.6);
      explanation += ' Adjusted downwards for part-time hourly demands.';
    }
  }

  if (isUrgent) {
    minSalary = Math.round(minSalary * 1.15);
    maxSalary = Math.round(maxSalary * 1.15);
    explanation += ' Includes a premium for immediate/urgent booking requests.';
  }

  return { minSalary, maxSalary, frequency, explanation };
}

function getMockImprovedDescription(title, serviceType, description) {
  const typeCapitalized = serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
  const improvedDescription = `We are actively looking for a dedicated and skilled ${typeCapitalized} to assist our family with household requirements. The ideal applicant should be professional, reliable, and committed to high standards of hygiene and promptness. The position is located at our residence. We offer competitive remuneration, comfortable work settings, and a friendly environment. If you possess relevant background experience and have verified local credentials, we look forward to discussing the opportunities with you.`;
  
  const defaultResponsibilities = {
    maid: ['Clean floors, bathrooms, and utility areas daily', 'Organize laundry, ironing, and closet maintenance', 'Perform regular dusting and deep cleaning tasks'],
    cook: ['Plan daily menu options in compliance with dietary preferences', 'Prepare healthy, fresh hygiene-conscious meals', 'Maintain kitchen hygiene and order grocery inventory'],
    plumber: ['Inspect water piping, fixtures, and drainage configurations', 'Repair leaky faucets, blocked drains, and geyser pipes', 'Perform pipe replacements and leak testing'],
    electrician: ['Inspect home wiring panels, circuits, and switches', 'Repair or replace faulty fans, light configurations, and points', 'Ensure electrical safety and load balancing check'],
    driver: ['Maintain cleanliness, fluid levels, and maintenance schedules of the car', 'Drive family members safely to office, school, and markets', 'Keep accurate logs of mileage, tolls, and refueling receipts']
  };

  const defaultSkills = {
    maid: ['Housekeeping protocols', 'Use of vacuum cleaners & cleaning chemicals', 'Punctuality'],
    cook: ['Indian cuisine expertise', 'Food hygiene standards', 'Time management'],
    plumber: ['Sanitary fitting installation', 'Leak diagnostic skills', 'Knowledge of PVC & copper piping'],
    electrician: ['Circuit diagnostics', 'Appliance troubleshooting', 'Safety compliance standards'],
    driver: ['Safe driving record', 'Google Maps navigation', 'Basic vehicle troubleshooting']
  };

  const keyResponsibilities = defaultResponsibilities[serviceType.toLowerCase()] || [
    'Execute core tasks associated with the service requirement',
    'Follow direct instructions from the household head',
    'Maintain high standards of professionalism and safety'
  ];

  const requiredSkills = defaultSkills[serviceType.toLowerCase()] || [
    'Relevant prior experience',
    'Punctual and reliable track record',
    'Effective local communication skills'
  ];

  return { improvedDescription, keyResponsibilities, requiredSkills };
}

function getMockReviewSummary(reviews) {
  const ratings = reviews.map(r => r.rating);
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  
  let summary = '';
  if (avg >= 4.5) {
    summary = 'Consistently receives high praise for exceptional work quality, punctuality, and excellent communication. Customers frequently describe them as extremely trustworthy and polite.';
  } else if (avg >= 3.8) {
    summary = 'Well-regarded by clients for reliable service and professional expertise. Noted for being cooperative and finishing jobs on schedule with good overall ratings.';
  } else {
    summary = 'Maintains a standard service score with moderate customer feedback. Some areas of improvement noted regarding arrival times, though overall service is satisfactory.';
  }
  return { summary };
}
