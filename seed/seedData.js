import bcrypt from 'bcryptjs';
import sequelize from '../server/config/database.js';
import {
  User,
  Worker,
  Job,
  Review,
  Application,
  Conversation,
  ConversationParticipant,
  Message,
  Verification,
  FraudAlert
} from '../server/models/index.js';

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 
  'Pune', 'Kolkata', 'Ahmedabad'
];

const CITY_COORDINATES = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 }
};

const SKILLS_BY_CATEGORY = {
  'Plumbing': ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Water Heater Repair', 'Fixture Replacement'],
  'Electrical': ['Wiring', 'Outlet Installation', 'Lighting Fixture', 'Panel Upgrade', 'Electrical Safety'],
  'Cleaning': ['Deep Cleaning', 'Carpet Cleaning', 'Window Washing', 'Post-Construction Cleaning', 'Organizing'],
  'Gardening': ['Lawn Mowing', 'Pruning', 'Weeding', 'Landscaping', 'Irrigation Setup'],
  'Carpentry': ['Furniture Assembly', 'Cabinet Installation', 'Framing', 'Deck Repair', 'Wood Sanding'],
  'Painting': ['Interior Painting', 'Exterior Painting', 'Wallpaper Removal', 'Drywall Patching', 'Staining'],
  'HVAC': ['AC Repair', 'Heating Installation', 'Duct Cleaning', 'Thermostat Setup', 'Filter Replacement'],
  'Appliances': ['Refrigerator Repair', 'Washing Machine Repair', 'Oven Troubleshooting', 'Dishwasher Setup']
};

const SERVICE_TYPES = Object.keys(SKILLS_BY_CATEGORY);

const REVIEW_TEMPLATES = [
  { rating: 5, text: 'Absolutely fantastic work! Prompt, professional, and went above and beyond.' },
  { rating: 5, text: 'Very satisfied with the service. They solved the issue in no time.' },
  { rating: 4, text: 'Great job overall. Arrived slightly late but completed the task perfectly.' },
  { rating: 4, text: 'Professional service and reasonable rates. Would recommend.' },
  { rating: 3, text: 'Decent work, but communication could have been better.' },
  { rating: 2, text: 'Disappointed. The work was rushed and the issue returned a few days later.' },
  { rating: 1, text: 'Horrible experience. Damaged my property and refused to take responsibility.' }
];

async function seed() {
  console.log('[SEED] Starting database seeding (India-based context)...');
  
  try {
    // 1. Force sync to clear all tables and recreate them
    console.log('[SEED] Syncing database (force: true) to clear existing data...');
    await sequelize.sync({ force: true });
    console.log('[SEED] Database tables recreated successfully.');

    // 2. Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Create Admin Account
    console.log('[SEED] Creating Admin Account...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@homeconnect.com',
      password: hashedPassword,
      phone: '+919876543210',
      city: 'Mumbai',
      role: 'admin'
    });
    console.log(`[SEED] Created Admin: ${admin.email}`);

    // 4. Create 8 Homeowners (role = 'user')
    console.log('[SEED] Creating 8 Indian Homeowners...');
    const homeownerNames = [
      'Amit Sharma', 'Sunita Patel', 'Rajesh Iyer', 'Priya Nair', 
      'Anil Kapoor', 'Kavita Reddy', 'Vikram Malhotra', 'Neha Sen'
    ];
    const homeowners = [];
    for (let i = 0; i < 8; i++) {
      const name = homeownerNames[i];
      const city = CITIES[i % CITIES.length];
      const homeowner = await User.create({
        name: name,
        email: `homeowner${i + 1}@example.com`,
        password: hashedPassword,
        phone: `+91900001000${i}`,
        city: city,
        role: 'user'
      });
      homeowners.push(homeowner);
    }
    console.log(`[SEED] Created ${homeowners.length} homeowners.`);

    // 5. Create 20 Workers (role = 'worker' + Worker profile)
    console.log('[SEED] Creating 20 Indian Workers...');
    const workers = [];
    const workerNames = [
      'Ramesh Kumar', 'Sanjay Shinde', 'Kamlesh Verma', 'Harpreet Singh', 'Manish Joshi',
      'Suresh Gupta', 'Naresh Reddy', 'Gopal Rao', 'Ravi Shankar', 'Abdul Khan',
      'Devendra Singh', 'Ashok Patel', 'Manoj Mishra', 'Santosh Yadav', 'Rajesh Patil',
      'Dinesh Shinde', 'Vikram Rathore', 'Anand Kulkarni', 'Sunil Joshi', 'Vijay Solanki'
    ];

    for (let i = 0; i < 20; i++) {
      const name = workerNames[i];
      const email = `worker${i + 1}@example.com`;
      const city = CITIES[i % CITIES.length];
      const category = SERVICE_TYPES[i % SERVICE_TYPES.length];
      const skills = SKILLS_BY_CATEGORY[category];
      const experience = Math.floor(Math.random() * 12) + 1; // 1-12 years
      
      // Determine verification status (12 verified, 5 pending, 3 rejected)
      let verificationStatus = 'verified';
      if (i >= 12 && i < 17) {
        verificationStatus = 'pending';
      } else if (i >= 17) {
        verificationStatus = 'rejected';
      }

      // Create User
      const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        phone: `+91800002000${i}`,
        city: city,
        role: 'worker'
      });

      // Create Worker profile
      const worker = await Worker.create({
        userId: user.id,
        headline: `Professional ${category} Expert with ${experience} Years of Experience`,
        skills: skills,
        experience: experience,
        languages: ['English', 'Hindi'],
        verificationStatus: verificationStatus,
        availabilityCalendar: [
          { day: 'Monday', slots: ['09:00-12:00', '13:00-17:00'] },
          { day: 'Wednesday', slots: ['09:00-12:00', '13:00-17:00'] },
          { day: 'Friday', slots: ['09:00-12:00', '13:00-17:00'] }
        ],
        portfolio: [
          { imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780', title: 'Recent Project A' },
          { imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e', title: 'Recent Project B' }
        ],
        aiReviewSummary: {
          text: `Highly skilled in ${category} operations. Noted for timely delivery and clear communications.`,
          generatedAt: new Date()
        }
      });
      
      workers.push(worker);
    }
    console.log(`[SEED] Created ${workers.length} workers.`);

    // 6. Create 15 Jobs (posted by homeowners)
    console.log('[SEED] Creating 15 Jobs...');
    const jobs = [];
    const jobTitles = [
      'Fix kitchen sink pipe leak', 'Re-wiring bathroom outlets', 'Deep clean 3-bedroom apartment',
      'Lawn pruning and trimming', 'Assemble 3 closets', 'Paint dining room walls (blue)',
      'AC unit blowing warm air', 'Fix refrigerator cooling issue', 'Clogged shower drain clearing',
      'Install ceiling fan in bedroom', 'Moveout cleaning service', 'Frontyard weeding and mulch',
      'Build custom wooden shelves', 'Paint house entrance door', 'Washing machine leakage repair'
    ];

    const jobDescriptions = [
      'Need an experienced plumber to fix a persistent leak under the kitchen sink. Water is pooling slightly in the cabinet.',
      'Require an electrician to swap out old outlets and install new GFCI outlets in the guest bathroom.',
      'Looking for a professional housekeeper to perform a deep clean of a 3-bedroom, 2-bathroom apartment.',
      'Our garden is overgrown. Need someone to prune the hedges, weed the flowerbeds, and mow the lawn.',
      'Need help assembling three large closets. All tools and parts are ready on site.',
      'Need to paint three walls in the dining room. Blue paint and brushes provided. Just need labor.',
      'Our central AC unit is running but only blowing warm air. Need diagnostic and repair.',
      'Refrigerator is not cooling properly, though the freezer works fine. Need troubleshooting.',
      'Shower drain is completely clogged with hair and soap residue. Need professional snaking.',
      'Need to replace an existing light fixture with a new ceiling fan in the master bedroom.',
      'Need a thorough move-out cleaning for a small studio apartment. Landlord inspection next day.',
      'Need weeding of flower beds and spreading of 4 bags of mulch in the frontyard garden.',
      'Looking for a carpenter to construct and install custom floating wooden shelves in the study room.',
      'Need painting of the wooden entrance door. Weather-proof paint is ready. Sanding required.',
      'Our frontload washing machine leaks water from the bottom door seal during spin cycles.'
    ];

    const jobCategories = [
      'Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Carpentry', 'Painting', 'HVAC', 'Appliances',
      'Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Carpentry', 'Painting', 'Appliances'
    ];

    for (let i = 0; i < 15; i++) {
      const homeowner = homeowners[i % homeowners.length];
      const category = jobCategories[i];
      const budget = 1000 + (i * 350); // ₹1000 to ₹6000
      const isEmergency = i % 5 === 0; // Every 5th job is emergency

      // Generate coordinates around selected city center (simulated)
      const center = CITY_COORDINATES[homeowner.city] || { lat: 19.0760, lng: 72.8777 };
      const lat = center.lat + (Math.random() - 0.5) * 0.1;
      const lng = center.lng + (Math.random() - 0.5) * 0.1;

      const job = await Job.create({
        userId: homeowner.id,
        serviceType: category,
        title: jobTitles[i],
        description: jobDescriptions[i],
        budget: budget,
        hours: Math.floor(Math.random() * 4) + 2,
        experience: Math.floor(Math.random() * 3) + 1,
        gender: 'Any',
        language: ['English', 'Hindi'],
        startDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)), // Daily offset
        address: `${homeowner.city}, Block ${i + 1}`,
        lat: lat,
        lng: lng,
        radius: 15,
        isEmergency: isEmergency,
        status: i % 4 === 0 ? 'assigned' : 'open'
      });

      jobs.push(job);
    }
    console.log(`[SEED] Created ${jobs.length} jobs.`);

    // 7. Create 60+ Reviews
    console.log('[SEED] Creating 60+ Reviews...');
    let reviewCount = 0;

    // Loop through jobs and write reviews from the job owner (homeowner)
    // for various workers.
    for (const job of jobs) {
      const homeownerId = job.userId;
      const selectedWorkers = [];
      
      // Pick 5 unique random workers
      while (selectedWorkers.length < 5) {
        const randomWorker = workers[Math.floor(Math.random() * workers.length)];
        if (!selectedWorkers.includes(randomWorker.id)) {
          selectedWorkers.push(randomWorker.id);
        }
      }

      for (const workerId of selectedWorkers) {
        const template = REVIEW_TEMPLATES[reviewCount % REVIEW_TEMPLATES.length];
        
        await Review.create({
          fromId: homeownerId,
          toId: workerId,
          jobId: job.id,
          rating: template.rating,
          text: template.text,
          ownerResponse: reviewCount % 7 === 0 ? 'Thank you so much for the review!' : '',
          helpfulCount: Math.floor(Math.random() * 10)
        });

        reviewCount++;
      }
    }
    console.log(`[SEED] Created ${reviewCount} reviews successfully.`);

    console.log('[SEED] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Database seeding failed:', error);
    process.exit(1);
  }
}

seed();
