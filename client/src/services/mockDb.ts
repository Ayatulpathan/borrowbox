import { User, Listing, Booking, Review, NotificationItem, AgentTask, PricingBreakdown } from '../types';

// Default Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'System Admin',
    email: 'admin@borrowbox.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    phone: '+8801711000001',
    bio: 'BorrowBox Platform Administrator & Trust Specialist.',
    location: { city: 'Dhaka', area: 'Gulshan 2', address: 'Road 45, House 12' },
    isVerified: true,
    rating: { average: 5.0, count: 24 },
  },
  {
    id: 'usr_tanvir',
    name: 'Tanvir Hossain',
    email: 'tanvir@borrowbox.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    phone: '+8801811223344',
    bio: 'Commercial filmmaker and photography gear enthusiast. All equipment is kept in pristine condition.',
    location: { city: 'Dhaka', area: 'Banani', address: 'Block C, Road 11' },
    isVerified: true,
    rating: { average: 4.9, count: 18 },
  },
  {
    id: 'usr_nusrat',
    name: 'Nusrat Jahan',
    email: 'nusrat@borrowbox.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    phone: '+8801911445566',
    bio: 'Outdoor explorer, camping enthusiast and DIY maker.',
    location: { city: 'Dhaka', area: 'Dhanmondi', address: 'Road 27' },
    isVerified: true,
    rating: { average: 5.0, count: 12 },
  },
  {
    id: 'usr_arefin',
    name: 'Arefin Shuvo',
    email: 'arefin@borrowbox.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    phone: '+8801611778899',
    bio: 'Freelance content creator and travel vlogger.',
    location: { city: 'Dhaka', area: 'Uttara', address: 'Sector 4' },
    isVerified: true,
    rating: { average: 4.8, count: 6 },
  },
];

// Default Seed Listings
const INITIAL_LISTINGS: Listing[] = [
  {
    _id: 'lst_1',
    title: 'Sony Alpha A7 IV Mirrorless Camera Kit (with 24-70mm GM Lens)',
    description: 'Professional full-frame 33MP hybrid camera with 4K 60p 10-bit recording, advanced autofocus, and the sharp Sony FE 24-70mm f/2.8 GM II lens. Ideal for commercial shoots, events, and cinematic video projects.',
    category: 'Cameras & Photography',
    owner: INITIAL_USERS[1],
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lst_2',
    title: 'DJI Mini 4 Pro Drone Fly More Combo (4K HDR)',
    description: 'Sub-249g ultra-compact drone with omnidirectional obstacle sensing, 4K/60fps HDR True Vertical Shooting, and 20km FHD video transmission. Includes 3 intelligent flight batteries and ND filter kit.',
    category: 'Cameras & Photography',
    owner: INITIAL_USERS[1],
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
      { key: 'Flight Time', value: '34 mins per battery' },
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lst_3',
    title: '4-Person 4-Season Waterproof Camping Tent + Inflatable Mat',
    description: 'Heavy-duty waterproof 3000mm hydrostatic head camping tent with dual vestibules, rapid 5-minute setup, and excellent wind stability. Comes with 2 double inflatable sleeping mats and LED tent lantern.',
    category: 'Outdoor & Camping',
    owner: INITIAL_USERS[2],
    pricing: { daily: 650, weekly: 3500 },
    securityDeposit: 1000,
    currency: 'BDT',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800',
    ],
    location: { city: 'Dhaka', area: 'Dhanmondi' },
    itemCondition: 'Like New',
    specs: [
      { key: 'Capacity', value: '4 Adults' },
      { key: 'Waterproof', value: 'PU 3000mm' },
    ],
    includedAccessories: ['Carrying Bag', 'Ground Stakes', 'Foot Pump for Mats', 'Camping Lantern'],
    rules: ['Dry completely before packing if rained on', 'No open flame inside tent'],
    cancellationPolicy: 'Flexible',
    pickupDelivery: { pickup: true, delivery: false },
    status: 'published',
    isFeatured: true,
    ratingSummary: { average: 4.8, count: 10 },
    totalBookings: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lst_4',
    title: 'Anker Nebula Capsule 3 Laser 1080p Smart Projector',
    description: 'Pocket-sized smart portable projector with laser-bright 300 ANSI lumens, Google TV, Dolby Digital audio, and built-in 2.5 hour battery. Great for rooftop movie nights or presentations.',
    category: 'Electronics & Audio',
    owner: INITIAL_USERS[2],
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
    ],
    includedAccessories: ['Tripod Stand', 'Remote Control', '65W USB-C Charger', 'HDMI Cable'],
    rules: ['Do not touch front laser optics', 'Keep dry and store in carry case'],
    cancellationPolicy: 'Flexible',
    pickupDelivery: { pickup: true, delivery: true, deliveryFee: 150 },
    status: 'published',
    isFeatured: true,
    ratingSummary: { average: 5.0, count: 4 },
    totalBookings: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lst_5',
    title: 'Bosch Professional 18V Cordless Rotary Hammer Drill Kit',
    description: 'Industrial-grade brushless cordless rotary hammer drill with chisel function, 2x 4.0Ah batteries, fast charger, and 30-piece masonry/wood drill bit set.',
    category: 'Tools & DIY',
    owner: INITIAL_USERS[2],
    pricing: { daily: 500, weekly: 2800 },
    securityDeposit: 800,
    currency: 'BDT',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
    ],
    location: { city: 'Dhaka', area: 'Dhanmondi' },
    itemCondition: 'Good',
    specs: [{ key: 'Power', value: '18V Brushless' }],
    includedAccessories: ['2x 4.0Ah Batteries', 'Charger', 'Drill Bit Set', 'Safety Goggles'],
    rules: ['Wear safety gear provided', 'Clean dust from chuck before return'],
    cancellationPolicy: 'Flexible',
    pickupDelivery: { pickup: true, delivery: false },
    status: 'published',
    isFeatured: false,
    ratingSummary: { average: 4.7, count: 5 },
    totalBookings: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lst_6',
    title: 'Sony PlayStation 5 Disc Console (2 Controllers + 5 Games)',
    description: 'PS5 console with ultra-high speed SSD, ray tracing, 4K 120Hz support. Includes 2 controllers, charging dock, and Spider-Man 2, God of War Ragnarok, EA FC 24, Gran Turismo 7, and It Takes Two.',
    category: 'Gaming & VR',
    owner: INITIAL_USERS[1],
    pricing: { daily: 1000, weekly: 5500 },
    securityDeposit: 2000,
    currency: 'BDT',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
    ],
    location: { city: 'Dhaka', area: 'Gulshan 1' },
    itemCondition: 'Like New',
    specs: [{ key: 'Storage', value: '825GB SSD + 1TB Expansion' }],
    includedAccessories: ['Power Cable', 'HDMI 2.1 Cable', 'Dual Charging Dock', '5 Disc Games'],
    rules: ['No account banning/jailbreaking', 'Return all game discs in cases'],
    cancellationPolicy: 'Strict',
    pickupDelivery: { pickup: true, delivery: true, deliveryFee: 200 },
    status: 'published',
    isFeatured: true,
    ratingSummary: { average: 4.9, count: 12 },
    totalBookings: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class MockDatabase {
  private users: User[] = [];
  private listings: Listing[] = [];
  private bookings: Booking[] = [];
  private reviews: Review[] = [];
  private favorites: Record<string, string[]> = {}; // userId -> listingId[]
  private tasks: AgentTask[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedUsers = localStorage.getItem('bb_users');
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

      const storedListings = localStorage.getItem('bb_listings');
      this.listings = storedListings ? JSON.parse(storedListings) : INITIAL_LISTINGS;

      const storedBookings = localStorage.getItem('bb_bookings');
      this.bookings = storedBookings ? JSON.parse(storedBookings) : [];

      const storedReviews = localStorage.getItem('bb_reviews');
      this.reviews = storedReviews ? JSON.parse(storedReviews) : [];

      const storedTasks = localStorage.getItem('bb_tasks');
      this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
    } catch (e) {
      this.users = INITIAL_USERS;
      this.listings = INITIAL_LISTINGS;
      this.bookings = [];
      this.reviews = [];
      this.tasks = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('bb_users', JSON.stringify(this.users));
      localStorage.setItem('bb_listings', JSON.stringify(this.listings));
      localStorage.setItem('bb_bookings', JSON.stringify(this.bookings));
      localStorage.setItem('bb_reviews', JSON.stringify(this.reviews));
      localStorage.setItem('bb_tasks', JSON.stringify(this.tasks));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable');
    }
  }

  // Auth Methods
  register(name: string, email: string, phone?: string): { user: User; token: string } {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email: email.toLowerCase(),
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      phone,
      isVerified: true,
      rating: { average: 5.0, count: 0 },
      location: { city: 'Dhaka', area: 'Gulshan' },
    };
    this.users.push(newUser);
    this.saveToStorage();
    return { user: newUser, token: 'mock_jwt_token_' + newUser.id };
  }

  login(email: string): { user: User; token: string } {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Auto-register convenience for seamless demo
      return this.register(email.split('@')[0], email);
    }
    return { user, token: 'mock_jwt_token_' + user.id };
  }

  // Listings
  getListings(params: any = {}): { data: Listing[]; pagination: any } {
    let filtered = [...this.listings];

    if (params.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'All') {
      filtered = filtered.filter((l) => l.category === params.category);
    }

    if (params.city) {
      filtered = filtered.filter((l) => l.location.city.toLowerCase().includes(params.city.toLowerCase()));
    }

    if (params.minPrice) {
      filtered = filtered.filter((l) => l.pricing.daily >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      filtered = filtered.filter((l) => l.pricing.daily <= Number(params.maxPrice));
    }

    return {
      data: filtered,
      pagination: {
        total: filtered.length,
        page: params.page || 1,
        totalPages: 1,
      },
    };
  }

  getListingById(id: string): Listing | null {
    return this.listings.find((l) => l._id === id) || null;
  }

  createListing(data: Partial<Listing>, owner: User): Listing {
    const newListing: Listing = {
      _id: 'lst_' + Math.random().toString(36).substring(2, 9),
      title: data.title || 'New Item',
      description: data.description || '',
      category: data.category || 'Cameras & Photography',
      owner,
      pricing: data.pricing || { daily: 1000 },
      securityDeposit: data.securityDeposit || 0,
      currency: 'BDT',
      images: data.images?.length ? data.images : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'],
      location: data.location || { city: 'Dhaka', area: 'Gulshan' },
      itemCondition: data.itemCondition || 'Like New',
      specs: data.specs || [],
      includedAccessories: data.includedAccessories || [],
      rules: data.rules || ['Standard rules apply'],
      cancellationPolicy: data.cancellationPolicy || 'Flexible',
      pickupDelivery: data.pickupDelivery || { pickup: true, delivery: false },
      status: data.status || 'published',
      isFeatured: false,
      ratingSummary: { average: 5.0, count: 0 },
      totalBookings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.listings.unshift(newListing);
    this.saveToStorage();
    return newListing;
  }

  // Bookings & Price Calculation
  calculatePrice(listing: Listing, startDate: string, endDate: string, deliveryOption = 'pickup'): PricingBreakdown {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const durationHours = Math.max(24, Math.ceil(diffMs / (1000 * 60 * 60)));
    const durationDays = Math.max(1, Math.ceil(durationHours / 24));

    let rateType: 'hourly' | 'daily' | 'weekly' = 'daily';
    let unitRate = listing.pricing.daily;
    let subtotal = durationDays * listing.pricing.daily;

    if (durationDays >= 7 && listing.pricing.weekly) {
      rateType = 'weekly';
      unitRate = listing.pricing.weekly;
      const weeks = Math.floor(durationDays / 7);
      const rem = durationDays % 7;
      subtotal = weeks * listing.pricing.weekly + rem * listing.pricing.daily;
    }

    const securityDeposit = listing.securityDeposit || 0;
    const serviceFee = Math.max(20, Math.round(subtotal * 0.05));
    const deliveryFee = deliveryOption === 'delivery' ? (listing.pickupDelivery?.deliveryFee || 0) : 0;
    const totalAmount = subtotal + securityDeposit + serviceFee + deliveryFee;

    return {
      rateType,
      unitRate,
      durationDays,
      durationHours,
      subtotal,
      securityDeposit,
      serviceFee,
      deliveryFee,
      totalAmount,
      currency: listing.currency || 'BDT',
      isAvailable: true,
    };
  }

  createBooking(params: {
    listingId: string;
    renter: User;
    startDate: string;
    endDate: string;
    deliveryOption?: 'pickup' | 'delivery';
    specialInstructions?: string;
  }): Booking {
    const listing = this.getListingById(params.listingId);
    if (!listing) throw new Error('Listing not found');

    const pricing = this.calculatePrice(listing, params.startDate, params.endDate, params.deliveryOption);
    const newBooking: Booking = {
      _id: 'bkg_' + Math.random().toString(36).substring(2, 9),
      listing,
      renter: params.renter,
      owner: listing.owner as User,
      startDate: params.startDate,
      endDate: params.endDate,
      rentalDuration: { days: pricing.durationDays, hours: pricing.durationHours },
      pricingBreakdown: pricing,
      deliveryOption: params.deliveryOption || 'pickup',
      specialInstructions: params.specialInstructions,
      status: 'pending',
      paymentStatus: 'simulated_paid',
      createdAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    this.saveToStorage();
    return newBooking;
  }

  getMyBookings(userId: string, type?: 'renter' | 'owner'): Booking[] {
    if (type === 'owner') {
      return this.bookings.filter((b) => (b.owner as any)?.id === userId || (b.owner as any)?._id === userId);
    }
    if (type === 'renter') {
      return this.bookings.filter((b) => (b.renter as any)?.id === userId || (b.renter as any)?._id === userId);
    }
    return this.bookings.filter(
      (b) =>
        (b.renter as any)?.id === userId ||
        (b.owner as any)?.id === userId ||
        (b.renter as any)?._id === userId ||
        (b.owner as any)?._id === userId
    );
  }

  updateBookingStatus(id: string, status: any): Booking {
    const b = this.bookings.find((item) => item._id === id);
    if (!b) throw new Error('Booking not found');
    b.status = status;
    this.saveToStorage();
    return b;
  }

  // AI Task Handler
  processAIMessage(prompt: string, user: User) {
    const lower = prompt.toLowerCase();
    let response = '';
    const toolCalls: any[] = [];
    let pendingAction: any = undefined;

    if (lower.includes('find') || lower.includes('search') || lower.includes('camera') || lower.includes('rent') || lower.includes('show')) {
      const listings = this.listings.slice(0, 3);
      toolCalls.push({
        toolName: 'searchListings',
        args: { query: prompt },
        result: { count: listings.length, results: listings },
        status: 'success',
      });
      response = `I found **${listings.length} available items** on BorrowBox:\n\n` +
        listings.map((l) => `• **${l.title}** (${l.category}) — ৳${l.pricing.daily}/day | ${l.location.city} | Rating: ⭐ ${l.ratingSummary?.average || 5.0}`).join('\n') +
        `\n\nWould you like me to check calendar availability or prepare a booking request for you?`;
    } else if (lower.includes('my booking') || lower.includes('my rentals')) {
      const myBookings = this.getMyBookings(user.id);
      toolCalls.push({
        toolName: 'getMyBookings',
        args: {},
        result: { count: myBookings.length },
        status: 'success',
      });
      if (myBookings.length > 0) {
        response = `Here are your current bookings:\n\n` +
          myBookings.map((b) => `• **${b.listing?.title}** (${b.status.toUpperCase()}) — ${new Date(b.startDate).toLocaleDateString()} to ${new Date(b.endDate).toLocaleDateString()} (Total: ৳${b.pricingBreakdown?.totalAmount})`).join('\n');
      } else {
        response = `You have no active bookings at the moment. Browse the marketplace to find gear you need!`;
      }
    } else if (lower.includes('summary') || lower.includes('earnings') || lower.includes('spending')) {
      response = `📊 **Your BorrowBox Account Summary**:\n\n` +
        `**Renter Summary:**\n- Active Rentals: 1\n- Total Spent: ৳8,670\n\n` +
        `**Lender Summary:**\n- Listed Items: 3\n- Total Earned: ৳14,500`;
    } else if (lower.includes('cancel booking')) {
      pendingAction = {
        toolName: 'cancelEligibleBooking',
        args: { reason: 'User requested cancellation via AI' },
        description: 'Cancel your latest booking reservation',
        requiresConfirmation: true,
      };
      response = `⚠️ **Cancellation Confirmation Required**: Are you sure you want to cancel this booking? Click confirm below to proceed.`;
    } else if (lower.includes('describe') || lower.includes('draft') || lower.includes('create listing')) {
      response = `✨ **AI Draft Created for Your Item:**\n\n` +
        `**Title:** Premium Gear Kit (Like New)\n\n` +
        `**Description:** High-performance, professionally maintained equipment. Includes all original cables and carrying case. Cleaned and tested before handover.\n\n` +
        `**Rules:**\n- Valid NID required at handover\n- Handle with care\n\nWould you like me to save this draft?`;
    } else {
      response = `Hello ${user.name}! I am your **BorrowBox AI Rental Assistant**.\n\nI can execute tasks such as:\n- Searching gear and checking live calendar availability\n- Calculating multi-day rental costs & deposits\n- Drafting high-converting listing copy\n- Checking and managing your bookings`;
    }

    const task: AgentTask = {
      _id: 'tsk_' + Math.random().toString(36).substring(2, 9),
      conversationId: 'conv_' + Math.random().toString(36).substring(2, 9),
      title: prompt.slice(0, 40),
      prompt,
      status: pendingAction ? 'awaiting_confirmation' : 'completed',
      plan: ['Analyze intent', 'Query database', 'Format verified response'],
      pendingAction,
      toolCalls,
      messages: [
        { role: 'user', content: prompt, timestamp: new Date().toISOString() },
        { role: 'model', content: response, timestamp: new Date().toISOString(), toolCalls, pendingAction },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    this.saveToStorage();

    return { task, response, pendingAction, toolCalls };
  }

  getTasks(): AgentTask[] {
    return this.tasks;
  }
}

export const mockDb = new MockDatabase();
