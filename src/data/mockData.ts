import { LocationZone, Item, ActivityEvent } from '../types';

export const CAMPUS_ZONES: LocationZone[] = [
  {
    id: 'zone_lib',
    name: 'William Knox Central Library',
    code: 'LIB',
    category: 'library',
    floors: ['1st Floor Commons', '2nd Floor Quiet Study', '3rd Floor Periodicals', 'Basement Stacks'],
    coordinates: { x: 36, y: 30 },
    hotspotRisk: 'high',
  },
  {
    id: 'zone_sci',
    name: 'Alan Turing Science Hall',
    code: 'SCI',
    category: 'academic',
    floors: ['Ground Floor Atrium', '2nd Floor Robotics Lab', '3rd Floor Lecture Hall A', '4th Floor Computing Lab'],
    coordinates: { x: 68, y: 24 },
    hotspotRisk: 'medium',
  },
  {
    id: 'zone_union',
    name: 'Student Activity Union & Food Court',
    code: 'UNN',
    category: 'student_center',
    floors: ['1st Floor Food Hall', '2nd Floor Gaming Lounge', '3rd Floor Campus Store & Post'],
    coordinates: { x: 46, y: 56 },
    hotspotRisk: 'high',
  },
  {
    id: 'zone_rec',
    name: 'Athletics & Recreation Center',
    code: 'REC',
    category: 'athletics',
    floors: ['Ground Gymnasium', 'Level 1 Fitness Center', 'Locker Rooms & Pool'],
    coordinates: { x: 18, y: 64 },
    hotspotRisk: 'medium',
  },
  {
    id: 'zone_transit',
    name: 'North Campus Metro Transit Terminal',
    code: 'TRN',
    category: 'transit',
    floors: ['Bus Bay 1-4', 'Train Platform East', 'Ticketing & Waiting Concourse'],
    coordinates: { x: 82, y: 68 },
    hotspotRisk: 'high',
  },
  {
    id: 'zone_arts',
    name: 'Fine Arts & Humanities Center',
    code: 'ART',
    category: 'academic',
    floors: ['1st Floor Exhibition Gallery', '2nd Floor Concert Hall', '3rd Floor Studio 302'],
    coordinates: { x: 22, y: 26 },
    hotspotRisk: 'low',
  },
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'LST-2026-0101',
    type: 'lost',
    title: 'Space Gray MacBook Pro 14" (M3)',
    category: 'electronics',
    subcategory: 'Laptop',
    brand: 'Apple',
    primaryColor: 'Gray',
    secondaryColor: 'Black',
    description: 'Left on desk while stepping out for 15 minutes. Has a dark gray incase sleeve.',
    distinctiveFeatures: 'GitHub Octocat holographic sticker and Python logo sticker on top lid. Slight scratch near left USB-C port.',
    location: {
      zoneId: 'zone_lib',
      zoneName: 'William Knox Central Library',
      floor: '2nd Floor Quiet Study',
      specificSpot: 'Desk row 14 near the south window',
      coordinates: { x: 38, y: 32 },
    },
    dateOccurred: '2026-08-31T14:30:00Z',
    dateReported: '2026-08-31T15:15:00Z',
    status: 'potential_match',
    reporter: {
      name: 'Maya Chen',
      contact: 'm.chen@campus.edu',
      role: 'student',
    },
    verificationQuestions: [
      'What stickers are on the laptop lid?',
      'What user account name appears on the lock screen?',
      'What color is the protective sleeve inside?'
    ],
    custodyLog: [
      {
        id: 'cl-1',
        timestamp: '2026-08-31T15:15:00Z',
        actor: 'Maya Chen (Reporter)',
        action: 'Report Filed',
        notes: 'Submitted online lost item declaration with detailed serial prefix info.',
      }
    ],
    imagePlaceholderColor: '#374151'
  },
  {
    id: 'FND-2026-0201',
    type: 'found',
    title: 'Apple MacBook Pro with Dark Sleeve',
    category: 'electronics',
    subcategory: 'Laptop',
    brand: 'Apple',
    primaryColor: 'Gray',
    description: 'Discovered unattended on study carrel desk during closing sweep. Packed in charcoal zipper sleeve.',
    distinctiveFeatures: 'Tech stickers including a cat figure on outer case.',
    location: {
      zoneId: 'zone_lib',
      zoneName: 'William Knox Central Library',
      floor: '2nd Floor Quiet Study',
      specificSpot: 'Desk 44, 2nd floor silent reading zone',
      coordinates: { x: 37, y: 33 },
    },
    dateOccurred: '2026-08-31T21:00:00Z',
    dateReported: '2026-08-31T21:40:00Z',
    status: 'potential_match',
    reporter: {
      name: 'Officer David Ross',
      contact: 'd.ross@campus-security.org',
      role: 'security',
    },
    verificationQuestions: [
      'What is the precise brand/text of stickers on the cover?',
      'What is the lock screen profile picture or username?',
      'What accessories or items were inside the sleeve pocket?'
    ],
    secretVerificationDetails: 'Lock screen user name: "Maya C". Small flash drive with red lanyard inside sleeve front pocket.',
    storageLocation: 'Library Security Office - Safe Locker #B4',
    custodyLog: [
      {
        id: 'cl-2',
        timestamp: '2026-08-31T21:40:00Z',
        actor: 'Officer David Ross',
        action: 'Intake Registered',
        notes: 'Secured in locker #B4. Power adapter was not found.',
      }
    ],
    imagePlaceholderColor: '#4b5563'
  },
  {
    id: 'LST-2026-0102',
    type: 'lost',
    title: 'Matte Black Hydro Flask 32oz Wide Mouth',
    category: 'personal_items',
    subcategory: 'Water Bottle',
    brand: 'Hydro Flask',
    primaryColor: 'Black',
    secondaryColor: 'Orange',
    description: 'Left near the bench press station. Contains electrolyte water mix.',
    distinctiveFeatures: 'Custom woven orange paracord handle strap. Small dent on bottom stainless rim.',
    location: {
      zoneId: 'zone_rec',
      zoneName: 'Athletics & Recreation Center',
      floor: 'Level 1 Fitness Center',
      specificSpot: 'Free weights bench area, rack #3',
      coordinates: { x: 19, y: 63 },
    },
    dateOccurred: '2026-09-01T10:15:00Z',
    dateReported: '2026-09-01T11:00:00Z',
    status: 'potential_match',
    reporter: {
      name: 'Jordan Rivera',
      contact: 'jrivera@campus.edu',
      role: 'student',
    },
    verificationQuestions: [
      'What custom strap or accessory is attached to the cap?',
      'What physical damage or markings are on the base?'
    ],
    custodyLog: [
      {
        id: 'cl-3',
        timestamp: '2026-09-01T11:00:00Z',
        actor: 'Jordan Rivera',
        action: 'Report Filed',
        notes: 'Item reported after searching gym workout area.',
      }
    ],
    imagePlaceholderColor: '#1f2937'
  },
  {
    id: 'FND-2026-0202',
    type: 'found',
    title: 'Hydro Flask Black Insulated Bottle w/ Cord Handle',
    category: 'personal_items',
    subcategory: 'Water Bottle',
    brand: 'Hydro Flask',
    primaryColor: 'Black',
    secondaryColor: 'Orange',
    description: 'Found under bench seat in gym workout area during cleaning cycle.',
    distinctiveFeatures: 'Braided bright orange paracord handle loop. Has minor base dent.',
    location: {
      zoneId: 'zone_rec',
      zoneName: 'Athletics & Recreation Center',
      floor: 'Level 1 Fitness Center',
      specificSpot: 'Bench press row near mirror wall',
      coordinates: { x: 18, y: 64 },
    },
    dateOccurred: '2026-09-01T11:30:00Z',
    dateReported: '2026-09-01T12:05:00Z',
    status: 'potential_match',
    reporter: {
      name: 'Samara Vance (Staff)',
      contact: 'svance@rec.campus.edu',
      role: 'staff',
    },
    verificationQuestions: [
      'What color is the woven handle cord?',
      'What beverage or residue was inside when discovered?'
    ],
    secretVerificationDetails: 'Orange braided cord handle, faint citrus electrolyte smell.',
    storageLocation: 'Rec Center Front Desk - Lost & Found Bin #2',
    custodyLog: [
      {
        id: 'cl-4',
        timestamp: '2026-09-01T12:05:00Z',
        actor: 'Samara Vance',
        action: 'Turned In',
        notes: 'Rinsed with clean water and placed in reception storage bin.',
      }
    ],
    imagePlaceholderColor: '#111827'
  },
  {
    id: 'LST-2026-0103',
    type: 'lost',
    title: 'Brown Leather Fossil Bi-fold Wallet',
    category: 'wallets_bags',
    subcategory: 'Wallet',
    brand: 'Fossil',
    primaryColor: 'Brown',
    description: 'Slipped out of jacket pocket while eating lunch at the food court.',
    distinctiveFeatures: 'Fossil embossed logo inside corner. Contains student ID card and city transit pass.',
    location: {
      zoneId: 'zone_union',
      zoneName: 'Student Activity Union & Food Court',
      floor: '1st Floor Food Hall',
      specificSpot: 'Booths by the noodle shop',
      coordinates: { x: 45, y: 55 },
    },
    dateOccurred: '2026-08-30T13:00:00Z',
    dateReported: '2026-08-30T14:10:00Z',
    status: 'potential_match',
    reporter: {
      name: 'Ethan Brooks',
      contact: 'ebrooks@campus.edu',
      role: 'student',
    },
    verificationQuestions: [
      'What are the last 4 digits of the student ID inside?',
      'What other transit or loyalty card is tucked in the back fold?'
    ],
    custodyLog: [
      {
        id: 'cl-5',
        timestamp: '2026-08-30T14:10:00Z',
        actor: 'Ethan Brooks',
        action: 'Report Filed',
        notes: 'Reported urgently due to presence of driver license and debit card.',
      }
    ],
    imagePlaceholderColor: '#78350f'
  },
  {
    id: 'FND-2026-0203',
    type: 'found',
    title: 'Men\'s Brown Leather Wallet',
    category: 'wallets_bags',
    subcategory: 'Wallet',
    brand: 'Fossil',
    primaryColor: 'Brown',
    description: 'Handed in by dining staff after table cleaning at Student Union.',
    distinctiveFeatures: 'Bi-fold distressed brown leather with cards intact.',
    location: {
      zoneId: 'zone_union',
      zoneName: 'Student Activity Union & Food Court',
      floor: '1st Floor Food Hall',
      specificSpot: 'Table 18, Central Dining Court',
      coordinates: { x: 47, y: 57 },
    },
    dateOccurred: '2026-08-30T13:45:00Z',
    dateReported: '2026-08-30T14:30:00Z',
    status: 'potential_match',
    reporter: {
      name: 'Carlos Mendez (Food Court Lead)',
      contact: 'cmendez@dining.campus.edu',
      role: 'staff',
    },
    verificationQuestions: [
      'What is the full name on the ID card inside?',
      'How much cash/denomination is in the bill sleeve?'
    ],
    secretVerificationDetails: 'Student ID belongs to Ethan Brooks (ID #94824920). Bill compartment has $24 in cash (one $20, four $1s).',
    storageLocation: 'Campus Security Main Dispatch - Safe Box #9',
    custodyLog: [
      {
        id: 'cl-6',
        timestamp: '2026-08-30T14:30:00Z',
        actor: 'Carlos Mendez',
        action: 'Transferred Custody',
        notes: 'Delivered directly to campus police dispatch for secure holding.',
      }
    ],
    imagePlaceholderColor: '#854d0e'
  },
  {
    id: 'LST-2026-0104',
    type: 'lost',
    title: 'AirPods Pro (2nd Gen) in Neon Green Spigen Case',
    category: 'electronics',
    subcategory: 'Earbuds',
    brand: 'Apple',
    primaryColor: 'Green',
    secondaryColor: 'White',
    description: 'Lost on Metro train or platform bench during morning commute.',
    distinctiveFeatures: 'Rugged neon green silicone protective case with small metal carabiner ring.',
    location: {
      zoneId: 'zone_transit',
      zoneName: 'North Campus Metro Transit Terminal',
      floor: 'Train Platform East',
      specificSpot: 'Bench near escalator entrance',
      coordinates: { x: 83, y: 69 },
    },
    dateOccurred: '2026-09-02T08:15:00Z',
    dateReported: '2026-09-02T08:45:00Z',
    status: 'reported',
    reporter: {
      name: 'Elena Rostova',
      contact: 'erostova@transit.city.gov',
      role: 'visitor',
    },
    verificationQuestions: [
      'What brand is stamped on the silicone case?',
      'What Bluetooth broadcast name shows when case opens?'
    ],
    custodyLog: [
      {
        id: 'cl-7',
        timestamp: '2026-09-02T08:45:00Z',
        actor: 'Elena Rostova',
        action: 'Report Filed',
        notes: 'Noticed missing upon arriving at office.',
      }
    ],
    imagePlaceholderColor: '#15803d'
  },
  {
    id: 'FND-2026-0204',
    type: 'found',
    title: 'Car Key Fob with Metal Carabiner & Blue Lanyard',
    category: 'keys',
    subcategory: 'Car Key',
    brand: 'Subaru',
    primaryColor: 'Black',
    secondaryColor: 'Blue',
    description: 'Picked up on stairs outside Alan Turing Science Hall main entrance.',
    distinctiveFeatures: 'Subaru key fob with 3 home keys, gym barcode tag, and navy blue fabric lanyard.',
    location: {
      zoneId: 'zone_sci',
      zoneName: 'Alan Turing Science Hall',
      floor: 'Ground Floor Atrium',
      specificSpot: 'Exterior front steps leading to courtyard',
      coordinates: { x: 67, y: 26 },
    },
    dateOccurred: '2026-09-01T16:20:00Z',
    dateReported: '2026-09-01T16:50:00Z',
    status: 'reported',
    reporter: {
      name: 'Professor Liam Vance',
      contact: 'lvance@cs.campus.edu',
      role: 'staff',
    },
    verificationQuestions: [
      'What car manufacturer logo is on the key fob?',
      'What text or gym name is on the plastic barcode tag?'
    ],
    secretVerificationDetails: 'Subaru fob, gym tag says "Anytime Fitness Member #8831"',
    storageLocation: 'CS Department Administrative Office Desk',
    custodyLog: [
      {
        id: 'cl-8',
        timestamp: '2026-09-01T16:50:00Z',
        actor: 'Prof. Liam Vance',
        action: 'Registered Intake',
        notes: 'Stored in Department Office key cabinet.',
      }
    ],
    imagePlaceholderColor: '#1e293b'
  },
  {
    id: 'FND-2026-0205',
    type: 'found',
    title: 'Black Casio G-Shock Digital Watch',
    category: 'personal_items',
    subcategory: 'Watch',
    brand: 'Casio',
    primaryColor: 'Black',
    description: 'Found on the side bench of the recreation center pool concourse.',
    distinctiveFeatures: 'Model DW-5600 with red accent text. Strap shows slight salt/water wear.',
    location: {
      zoneId: 'zone_rec',
      zoneName: 'Athletics & Recreation Center',
      floor: 'Locker Rooms & Pool',
      specificSpot: 'Bleachers near lane 4',
      coordinates: { x: 17, y: 66 },
    },
    dateOccurred: '2026-08-29T18:00:00Z',
    dateReported: '2026-08-29T19:00:00Z',
    status: 'reported',
    reporter: {
      name: 'Life Guard Desk',
      contact: 'aquatics@rec.campus.edu',
      role: 'staff',
    },
    verificationQuestions: [
      'What alarm time is set on the digital watch?',
      'What exact accent color is the border text around the face?'
    ],
    secretVerificationDetails: 'Red border line, alarm set for 06:30 AM.',
    storageLocation: 'Aquatics Office Safe Box',
    custodyLog: [
      {
        id: 'cl-9',
        timestamp: '2026-08-29T19:00:00Z',
        actor: 'Life Guard Desk',
        action: 'Turned In',
        notes: 'Drying and safely stored in Aquatics Office.',
      }
    ],
    imagePlaceholderColor: '#0f172a'
  }
];

export const INITIAL_EVENTS: ActivityEvent[] = [
  {
    id: 'evt-1',
    type: 'match_detected',
    timestamp: '10 minutes ago',
    description: 'Algorithmic matching engine paired MacBook Pro (LST-0101) with Found Laptop (FND-0201) at 94% confidence.',
    severity: 'highlight',
  },
  {
    id: 'evt-2',
    type: 'report_found',
    timestamp: '28 minutes ago',
    description: 'New item logged: Subaru Car Key Fob turned in at Science Hall Office.',
    severity: 'normal',
  },
  {
    id: 'evt-3',
    type: 'match_detected',
    timestamp: '1 hour ago',
    description: 'High spatial and attribute correlation detected for Hydro Flask Bottle (89% match).',
    severity: 'highlight',
  },
  {
    id: 'evt-4',
    type: 'claim_submitted',
    timestamp: '2 hours ago',
    description: 'Claim verification submitted for Fossil Leather Wallet by Ethan Brooks.',
    severity: 'normal',
  },
  {
    id: 'evt-5',
    type: 'item_returned',
    timestamp: 'Yesterday',
    description: 'Chain of custody closed: Sony Noise Cancelling Headphones verified and returned to owner.',
    severity: 'success',
  }
];
