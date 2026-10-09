import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Notification } from '../models/Notification.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to DB. Clearing existing data...');

    await User.deleteMany({});
    await Listing.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@borrowbox.com',
      passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      phone: '+8801711000001',
      bio: 'BorrowBox Platform Administrator & Trust Specialist.',
      location: { city: 'Dhaka', area: 'Gulshan 2', address: 'Road 45, House 12' },
      isVerified: true,
      rating: { average: 5.0, count: 24 },
    });

    const lender1 = await User.create({
      name: 'Tanvir Hossain',
      email: 'tanvir@borrowbox.com',
      passwordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      phone: '+8801811223344',
      bio: 'Commercial filmmaker and photography gear enthusiast. All equipment is kept in pristine condition.',
      location: { city: 'Dhaka', area: 'Banani', address: 'Block C, Road 11' },
      isVerified: true,
      rating: { average: 4.9, count: 18 },
    });

    const lender2 = await User.create({
      name: 'Nusrat Jahan',
      email: 'nusrat@borrowbox.com',
      passwordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      phone: '+8801911445566',
      bio: 'Outdoor explorer, camping enthusiast and DIY maker.',
      location: { city: 'Dhaka', area: 'Dhanmondi', address: 'Road 27' },
      isVerified: true,
      rating: { average: 5.0, count: 12 },
    });

    const renter1 = await User.create({
      name: 'Arefin Shuvo',
      email: 'arefin@borrowbox.com',
      passwordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      phone: '+8801611778899',
      bio: 'Freelance content creator and travel vlogger.',
      location: { city: 'Dhaka', area: 'Uttara', address: 'Sector 4' },
      isVerified: true,
      rating: { average: 4.8, count: 6 },
    });

    console.log('Creating verified marketplace listings...');

    const listingsData = [
      {
        title: 'Sony Alpha A7 IV Mirrorless Camera Kit (with 24-70mm GM Lens)',
        description: 'Professional full-frame 33MP hybrid camera with 4K 60p 10-bit recording, advanced autofocus, and the sharp Sony FE 24-70mm f/2.8 GM II lens. Ideal for commercial shoots, events, and cinematic video projects.',
        category: 'Cameras & Photography',
        owner: lender1._id,
        pricing: { hourly: 250, daily: 1800, weekly: 10500 },
        securityDeposit: 3000,
        currency: 'BDT',
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800',
        ],
        location: { city: 'Dhaka', area: 'Banani', address: 'Block C' },
        itemCondition: 'Like New',
        specs: [
          { key: 'Sensor', value: '33MP Full-Frame Exmor R' },
          { key: 'Video', value: '4K 60p 10-bit 4:2:2' },
          { key: 'Lens', value: 'Sony FE 24-70mm f/2.8 GM II' },
          { key: 'Cards', value: '2x 128GB V90 SDXC Included' },
        ],
        includedAccessories: ['2x NP-FZ100 Batteries', 'Dual Fast Charger', 'Peak Design Strap', 'Pelican Hard Case'],
        rules: [
          'Valid NID / Driving License required at handover',
          'Check sensor and lens glass at pickup and return',
          'No rain/water immersion',
        ],
        cancellationPolicy: 'Moderate',
        pickupDelivery: { pickup: true, delivery: true, deliveryFee: 200 },
        status: 'published',
        isFeatured: true,
        ratingSummary: { average: 5.0, count: 8 },
        totalBookings: 14,
      },
      {
        title: 'DJI Mini 4 Pro Drone Fly More Combo (4K HDR)',
        description: 'Sub-249g ultra-compact drone with omnidirectional obstacle sensing, 4K/60fps HDR True Vertical Shooting, and 20km FHD video transmission. Includes 3 intelligent flight batteries and ND filter kit.',
        category: 'Cameras & Photography',
        owner: lender1._id,
        pricing: { daily: 1400, weekly: 8000 },
        securityDeposit: 2500,
        currency: 'BDT',
        images: [
          'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800',
        ],
        location: { city: 'Dhaka', area: 'Banani' },
        itemCondition: 'Brand New',
        specs: [
          { key: 'Weight', value: '< 249g' },
          { key: 'Flight Time', value: '34 mins per battery (3 included)' },
          { key: 'Camera', value: '4K/60fps HDR 48MP' },
        ],
        includedAccessories: ['DJI RC 2 Controller', '3 Batteries + Hub', 'ND Filters (16/64/256)', 'Shoulder Bag'],
        rules: ['Fly in permitted airspace only', 'Operator is responsible for crash damage'],
        cancellationPolicy: 'Flexible',
        pickupDelivery: { pickup: true, delivery: true, deliveryFee: 150 },
        status: 'published',
        isFeatured: true,
        ratingSummary: { average: 4.9, count: 6 },
        totalBookings: 9,
      },
      {
        title: '4-Person 4-Season Waterproof Camping Tent + Inflatable Mat',
        description: 'Heavy-duty waterproof 3000mm hydrostatic head camping tent with dual vestibules, rapid 5-minute setup, and excellent wind stability. Comes with 2 double inflatable sleeping mats and LED tent lantern.',
        category: 'Outdoor & Camping',
        owner: lender2._id,
        pricing: { daily: 650, weekly: 3500 },
        securityDeposit: 1000,
        currency: 'BDT',
        images: [
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800',
        ],
        location: { city: 'Dhaka', area: 'Dhanmondi' },
        itemCondition: 'Like New',
        specs: [
          { key: 'Capacity', value: '4 Adults' },
          { key: 'Waterproof', value: 'PU 3000mm' },
          { key: 'Weight', value: '4.8 kg' },
        ],
        includedAccessories: ['Carrying Bag', 'Ground Stakes', 'Foot Pump for Mats', 'Camping Lantern'],
        rules: ['Dry completely before packing if rained on', 'No open flame inside tent'],
        cancellationPolicy: 'Flexible',
        pickupDelivery: { pickup: true, delivery: false },
        status: 'published',
        isFeatured: true,
        ratingSummary: { average: 4.8, count: 10 },
        totalBookings: 16,
      },
      {
        title: 'Anker Nebula Capsule 3 Laser 1080p Smart Projector',
        description: 'Pocket-sized smart portable projector with laser-bright 300 ANSI lumens, Google TV, Dolby Digital audio, and built-in 2.5 hour battery. Great for rooftop movie nights or presentations.',
        category: 'Electronics & Audio',
        owner: lender2._id,
        pricing: { daily: 900, weekly: 5000 },
        securityDeposit: 1500,
        currency: 'BDT',
        images: [
          'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
        ],
        location: { city: 'Dhaka', area: 'Dhanmondi' },
        itemCondition: 'Like New',
        specs: [
          { key: 'Resolution', value: '1080p FHD' },
          { key: 'Brightness', value: '300 ANSI Lumens' },
          { key: 'Battery', value: 'Up to 2.5 hours playtime' },
        ],
        includedAccessories: ['Tripod Stand', 'Remote Control', '65W USB-C Charger', 'HDMI Cable'],
        rules: ['Do not touch front laser optics', 'Keep dry and store in carry case'],
        cancellationPolicy: 'Flexible',
        pickupDelivery: { pickup: true, delivery: true, deliveryFee: 150 },
        status: 'published',
        isFeatured: true,
        ratingSummary: { average: 5.0, count: 4 },
        totalBookings: 7,
      },
      {
        title: 'Bosch Professional 18V Cordless Rotary Hammer Drill & Tool Kit',
        description: 'Industrial-grade brushless cordless rotary hammer drill with chisel function, 2x 4.0Ah batteries, fast charger, and 30-piece masonry/wood drill bit set for home renovations and DIY.',
        category: 'Tools & DIY',
        owner: lender2._id,
        pricing: { daily: 500, weekly: 2800 },
        securityDeposit: 800,
        currency: 'BDT',
        images: [
          'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
        ],
        location: { city: 'Dhaka', area: 'Dhanmondi' },
        itemCondition: 'Good',
        specs: [
          { key: 'Power', value: '18V Brushless' },
          { key: 'Impact Energy', value: '2.0 Joules' },
        ],
        includedAccessories: ['2x 4.0Ah Batteries', 'Charger', 'Drill Bit Set', 'Safety Goggles & Gloves'],
        rules: ['Wear safety gear provided', 'Clean dust from chuck before return'],
        cancellationPolicy: 'Flexible',
        pickupDelivery: { pickup: true, delivery: false },
        status: 'published',
        isFeatured: false,
        ratingSummary: { average: 4.7, count: 5 },
        totalBookings: 8,
      },
      {
        title: 'Sony PlayStation 5 Disc Console (with 2 DualSense Controllers + 5 Games)',
        description: 'PS5 console with ultra-high speed SSD, ray tracing, 4K 120Hz support. Includes 2 controllers, charging dock, and Spider-Man 2, God of War Ragnarok, EA FC 24, Gran Turismo 7, and It Takes Two.',
        category: 'Gaming & VR',
        owner: lender1._id,
        pricing: { daily: 1000, weekly: 5500 },
        securityDeposit: 2000,
        currency: 'BDT',
        images: [
          'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
        ],
        location: { city: 'Dhaka', area: 'Gulshan 1' },
        itemCondition: 'Like New',
        specs: [
          { key: 'Storage', value: '825GB SSD + 1TB Expansion' },
          { key: 'Controllers', value: '2x DualSense Wireless' },
        ],
        includedAccessories: ['Power Cable', 'HDMI 2.1 Cable', 'Dual Controller Charging Dock', '5 Disc Games'],
        rules: ['No account banning/jailbreaking', 'Return all game discs in cases'],
        cancellationPolicy: 'Strict',
        pickupDelivery: { pickup: true, delivery: true, deliveryFee: 200 },
        status: 'published',
        isFeatured: true,
        ratingSummary: { average: 4.9, count: 12 },
        totalBookings: 19,
      },
    ];

    const createdListings = await Listing.insertMany(listingsData);
    console.log(`Created ${createdListings.length} listings.`);

    console.log('Creating sample bookings and reviews...');
    const booking1 = await Booking.create({
      listing: createdListings[0]._id,
      renter: renter1._id,
      owner: lender1._id,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rentalDuration: { days: 3, hours: 72 },
      pricingBreakdown: {
        rateType: 'daily',
        unitRate: 1800,
        subtotal: 5400,
        securityDeposit: 3000,
        serviceFee: 270,
        deliveryFee: 0,
        totalAmount: 8670,
        currency: 'BDT',
      },
      deliveryOption: 'pickup',
      status: 'completed',
      paymentStatus: 'simulated_paid',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Review.create({
      booking: booking1._id,
      listing: createdListings[0]._id,
      reviewer: renter1._id,
      targetUser: lender1._id,
      rating: 5,
      comment: 'The Sony A7 IV was in absolute immaculate condition! Tanvir was super helpful, explained all the custom picture profiles, and battery life was flawless. Will definitely rent again!',
    });

    // Sample active booking
    await Booking.create({
      listing: createdListings[2]._id,
      renter: renter1._id,
      owner: lender2._id,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      rentalDuration: { days: 3, hours: 72 },
      pricingBreakdown: {
        rateType: 'daily',
        unitRate: 650,
        subtotal: 1950,
        securityDeposit: 1000,
        serviceFee: 98,
        deliveryFee: 0,
        totalAmount: 3048,
        currency: 'BDT',
      },
      deliveryOption: 'pickup',
      status: 'approved',
      paymentStatus: 'simulated_paid',
      confirmedAt: new Date(),
    });

    // Sample pending booking request for owner review
    await Booking.create({
      listing: createdListings[1]._id,
      renter: renter1._id,
      owner: lender1._id,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      rentalDuration: { days: 2, hours: 48 },
      pricingBreakdown: {
        rateType: 'daily',
        unitRate: 1400,
        subtotal: 2800,
        securityDeposit: 2500,
        serviceFee: 140,
        deliveryFee: 150,
        totalAmount: 5590,
        currency: 'BDT',
      },
      deliveryOption: 'delivery',
      deliveryAddress: 'Sector 4, Uttara, Dhaka',
      specialInstructions: 'Need this for an outdoor weekend documentary shoot.',
      status: 'pending',
      paymentStatus: 'simulated_paid',
    });

    // Seed notifications
    await Notification.create([
      {
        user: lender1._id,
        title: 'New Booking Request 📦',
        message: 'Arefin Shuvo requested to rent "DJI Mini 4 Pro Drone" for 2 days.',
        type: 'booking_request',
        link: '/bookings',
        isRead: false,
      },
      {
        user: renter1._id,
        title: 'Booking Confirmed! 🎉',
        message: 'Nusrat Jahan accepted your booking for "4-Person Camping Tent".',
        type: 'booking_approved',
        link: '/bookings',
        isRead: true,
      },
    ]);

    console.log('✅ Database successfully seeded!');
    console.log(`Demo Logins:
- Admin: admin@borrowbox.com / password123
- Lender: tanvir@borrowbox.com / password123
- Renter: arefin@borrowbox.com / password123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
