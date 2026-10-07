require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Incident = require('../models/Incident');
const { connectDB, disconnectDB } = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing Users and Incidents...');
    await User.deleteMany({});
    await Incident.deleteMany({});

    console.log('[Seed] Creating demo users for all three roles...');

    // Password hashes will be created automatically via User model pre-save hook
    const admin = await User.create({
      name: 'Commander Rajesh Sharma',
      email: 'admin@hillresq.org',
      passwordHash: 'admin123',
      role: 'admin'
    });

    const responder = await User.create({
      name: 'Capt. Anita Verma (Mountain Rescue 1)',
      email: 'responder@hillresq.org',
      passwordHash: 'responder123',
      role: 'responder'
    });

    const responder2 = await User.create({
      name: 'Sub-Inspector Vikram Thapa (SDRF)',
      email: 'vikram@hillresq.org',
      passwordHash: 'responder123',
      role: 'responder'
    });

    const citizen = await User.create({
      name: 'Devendra Negi (Local Resident)',
      email: 'citizen@hillresq.org',
      passwordHash: 'citizen123',
      role: 'citizen'
    });

    console.log(`[Seed] Created users:
      - Admin: admin@hillresq.org / admin123
      - Responders: responder@hillresq.org, vikram@hillresq.org / responder123
      - Citizen: citizen@hillresq.org / citizen123`);

    console.log('[Seed] Creating realistic hilly-region emergency incidents...');

    const incidents = [
      {
        title: 'Major Landslide Blocking National Highway 21 near Pandoh Dam',
        description: 'Substantial rockslide and mud debris of approximately 400 cubic meters has completely severed both lanes of NH-21. Boulders continuing to roll down the slope. High risk to motorists. Heavy earthmoving machinery and SDRF team needed urgently.',
        type: 'landslide',
        severity: 'critical',
        latitude: 31.6700,
        longitude: 77.0500,
        locationName: 'NH-21 KM 188, Mandi-Pandoh Stretch, Himachal Pradesh',
        imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        reportedBy: citizen._id,
        assignedTo: responder._id,
        status: 'in_progress',
        responseNotes: 'Quick Response Team deployed with 2 JCB excavators. Perimeter cordoned off from KM 186. Traffic diverted via Kamand alternative route.'
      },
      {
        title: 'Flash Flood Debris Flow and Swollen Riverbed near Beas Tributary',
        description: 'Sudden cloudburst upstream has triggered flash flooding in the tributary nullah. Flood waters overflowed embankment onto the municipal connecting bridge. 3 vehicles stranded on high ground. Evacuation of low-lying settlements recommended.',
        type: 'flood',
        severity: 'critical',
        latitude: 31.9579,
        longitude: 77.1095,
        locationName: 'Kullu Valley Left Bank Road, Near Akhara Bazar',
        imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
        reportedBy: citizen._id,
        assignedTo: responder._id,
        status: 'assigned',
        responseNotes: 'Disaster management alert sounded. Siren activated in Akhara Bazar. Evacuation shelter prepared at Government College.'
      },
      {
        title: 'Multiple Fallen Pine Trees Disrupting Traffic on Ridge Road',
        description: 'Gale force winds and heavy snowfall caused 3 large cedar/pine trees to collapse across the vehicular road. High voltage electric power line also damaged and touching asphalt. Area currently without grid power.',
        type: 'fallen_tree',
        severity: 'medium',
        latitude: 31.1048,
        longitude: 77.1734,
        locationName: 'The Ridge - Upper Jakhu Road, Shimla',
        imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        reportedBy: citizen._id,
        assignedTo: null,
        status: 'reported',
        responseNotes: ''
      },
      {
        title: 'Structural Crack in Bailey Bridge following Torrential Rains',
        description: 'Severe structural buckling observed on the southern pillar abutment of the suspension bridge. Heavy commercial vehicles must be stopped immediately to avoid catastrophic collapse.',
        type: 'infrastructure_damage',
        severity: 'high',
        latitude: 32.2432,
        longitude: 77.1892,
        locationName: 'Old Bailey Bridge, Solang Nallah Access Road, Manali',
        imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
        reportedBy: citizen._id,
        assignedTo: null,
        status: 'verified',
        responseNotes: 'Inspected by PWD junior engineer. Verified load capacity breach. Warning signage installed.'
      },
      {
        title: 'Boulder Avalanche Cleared on McLeod Ganj Link Road',
        description: 'A cluster of heavy dolomite boulders detached from the upper ridge blocking access to the primary health center and local schools.',
        type: 'road_block',
        severity: 'medium',
        latitude: 32.2396,
        longitude: 76.3245,
        locationName: 'McLeod Ganj - Dharamkot Road, Kangra District',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        reportedBy: citizen._id,
        assignedTo: responder._id,
        status: 'resolved',
        responseNotes: 'Rocks fractured using hydraulic splitters and removed from roadway. Guard rails reinstalled. Normal vehicular movement restored.'
      },
      {
        title: 'Active Mudslide Threatening Terraced Farmland and Water Supply',
        description: 'Continuous soil seepage resulting in creeping mudflow towards the village water filtration plant. Silt contamination observed in domestic feeder line.',
        type: 'landslide',
        severity: 'high',
        latitude: 31.0500,
        longitude: 77.2500,
        locationName: 'Kufri - Fagu Agricultural Ridge, Shimla Hills',
        imageUrl: null,
        reportedBy: citizen._id,
        assignedTo: responder2._id,
        status: 'in_progress',
        responseNotes: 'Temporary diversion channels dug to direct mudflow away from reservoir tanks. Water supply safely isolated.'
      }
    ];

    await Incident.insertMany(incidents);
    console.log(`[Seed] Inserted ${incidents.length} realistic incident reports.`);

    console.log('[Seed] Database successfully seeded! 🎉');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
