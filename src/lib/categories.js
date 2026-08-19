// iBarti V1 Exchange-Type architecture.
// Three top-level Exchange Types; a 24-category V1 tree under them; each
// category declares which exchange types it belongs to and its subcategories.
// Existing category IDs are preserved so saved listings keep resolving.

export const EXCHANGE_TYPES = [
  { id: 'goods', icon: '📦' },
  { id: 'services', icon: '🛠' },
  { id: 'digital', icon: '💻' }
];

export const EXCHANGE_TYPE_IDS = EXCHANGE_TYPES.map((x) => x.id);

// 24-category V1 tree — broad enough that subcategories together cover
// virtually anything someone could barter.
// `exchange_types` lists which top-level types a category can appear under.
// `subcategories` is the ordered list of V1 subcategory display names.
export const CATEGORY_TREE = [
  {
    id: 'electronics_technology',
    exchange_types: ['goods', 'digital'],
    subcategories: ['Phones', 'Laptops', 'Desktops', 'Tablets', 'Cameras & Photo', 'Audio & Sound', 'Gaming', 'TVs & Displays', 'Smart Home', 'Wearables', 'Components & Parts', 'Accessories']
  },
  {
    id: 'home_furniture',
    exchange_types: ['goods'],
    subcategories: ['Furniture', 'Home Decor', 'Kitchen & Dining', 'Large Appliances', 'Small Appliances', 'Lighting', 'Bedding', 'Bathroom', 'Storage & Organization', 'Rugs & Textiles']
  },
  {
    id: 'fashion_personal',
    exchange_types: ['goods'],
    subcategories: ['Clothing', 'Shoes', 'Bags', 'Watches', 'Jewelry', 'Eyewear', 'Hats & Accessories', 'Costume', 'Vintage Fashion', 'Kids Fashion']
  },
  {
    id: 'beauty_wellness',
    exchange_types: ['goods', 'services'],
    subcategories: ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Spa & Treatments', 'Hair Services', 'Beauty Sessions', 'Grooming']
  },
  {
    id: 'books_education',
    exchange_types: ['goods', 'digital'],
    subcategories: ['Books', 'Textbooks', 'Magazines', 'Comics & Manga', 'Study Materials', 'Online Courses', 'Educational Toys', 'Stationery']
  },
  {
    id: 'creative_design',
    exchange_types: ['services', 'digital'],
    subcategories: ['Graphic Design', 'Illustration', 'Photography', 'Video & Film', 'Animation', 'Writing & Copywriting', 'Editing', 'Music Production', 'Handmade Art', 'Crafts']
  },
  {
    id: 'digital_online_services',
    exchange_types: ['services', 'digital'],
    subcategories: ['Web Development', 'App Development', 'Software & Apps', 'SEO', 'Digital Marketing', 'Social Media', 'Virtual Assistance', 'Cloud & Hosting', 'Domains & Accounts']
  },
  {
    id: 'repairs_practical',
    exchange_types: ['services'],
    subcategories: ['Electrical', 'Plumbing', 'Carpentry', 'Electronics Repair', 'Computer Repair', 'Phone Repair', 'Appliance Repair', 'Vehicle Repair', 'Handyman', 'Painting', 'Moving Help']
  },
  {
    id: 'business_professional',
    exchange_types: ['services', 'digital'],
    subcategories: ['Consulting', 'Marketing', 'Accounting', 'Legal', 'HR & Recruitment', 'Translation', 'Research', 'Grant Writing', 'Admin Support']
  },
  {
    id: 'vehicles_transport',
    exchange_types: ['goods', 'services'],
    subcategories: ['Cars', 'Motorcycles', 'Scooters', 'Bicycles', 'Auto Parts', 'Tires & Wheels', 'Transport Services', 'Delivery', 'Shipping']
  },
  {
    id: 'sports_hobbies',
    exchange_types: ['goods'],
    subcategories: ['Sports Equipment', 'Fitness Gear', 'Outdoor & Camping', 'Cycling', 'Fishing', 'Hunting', 'Musical Instruments', 'Board Games', 'Hobby Supplies']
  },
  {
    id: 'collectibles_vintage',
    exchange_types: ['goods'],
    subcategories: ['Stamps', 'Coins', 'Antiques', 'Memorabilia', 'Vintage Electronics', 'Trading Cards', 'Vinyl & Records', 'Comic Books', 'Art Collectibles']
  },
  {
    id: 'food_garden_homemade',
    exchange_types: ['goods'],
    subcategories: ['Baked Goods', 'Preserves', 'Plants', 'Seeds', 'Home-Grown Produce', 'Honey', 'Bulk Food', 'Beverages']
  },
  {
    id: 'tools_machinery',
    exchange_types: ['goods', 'services'],
    subcategories: ['Power Tools', 'Hand Tools', 'Workshop', 'Machinery', 'Construction', 'Industrial', 'Farming Tools']
  },
  {
    id: 'health_medical',
    exchange_types: ['goods', 'services'],
    subcategories: ['Medical Equipment', 'Mobility Aids', 'First Aid', 'Therapies', 'Counseling', 'Fitness Training', 'Nutrition']
  },
  {
    id: 'kids_baby',
    exchange_types: ['goods'],
    subcategories: ['Toys', 'Baby Gear', 'Kids Clothing', 'Kids Furniture', 'Educational Toys', 'Games', 'School Supplies', 'Strollers & Carriers']
  },
  {
    id: 'pets_animals',
    exchange_types: ['goods', 'services'],
    subcategories: ['Pet Food & Supplies', 'Pet Accessories', 'Enclosures', 'Pet Care Services', 'Grooming', 'Training', 'Animals & Livestock']
  },
  {
    id: 'real_estate_housing',
    exchange_types: ['goods', 'services'],
    subcategories: ['Rentals', 'Rooms & Shares', 'Parking', 'Storage', 'Renovation', 'Furniture', 'Estate Services']
  },
  {
    id: 'media_entertainment',
    exchange_types: ['goods', 'digital'],
    subcategories: ['Movies', 'Music', 'Video Games', 'Streaming Accounts', 'Software Licenses', 'E-books', 'Digital Art', 'Audiobooks']
  },
  {
    id: 'office_stationery',
    exchange_types: ['goods'],
    subcategories: ['Office Supplies', 'Stationery', 'Printers', 'Ink & Toner', 'Office Furniture', 'Filing', 'Labels']
  },
  {
    id: 'events_hospitality',
    exchange_types: ['services', 'goods'],
    subcategories: ['Event Planning', 'Catering', 'Venues', 'Event Photography', 'Hospitality', 'Lodging', 'Travel Hosting']
  },
  {
    id: 'travel_experiences',
    exchange_types: ['services', 'digital'],
    subcategories: ['Accommodation', 'Tours', 'Experiences', 'Travel Planning', 'Ticketing', 'Travel Swaps']
  },
  {
    id: 'agriculture_farming',
    exchange_types: ['goods', 'services'],
    subcategories: ['Crops', 'Livestock', 'Feed', 'Seeds & Saplings', 'Equipment', 'Land Share', 'Farming Services']
  },
  {
    id: 'other_mixed',
    exchange_types: ['goods', 'services', 'digital'],
    subcategories: ['Mixed Lots', 'Barter Bundles', 'Miscellaneous', 'Unclassified']
  }
];

export const CATEGORY_IDS = CATEGORY_TREE.map((c) => c.id);

export const getCategory = (id) => CATEGORY_TREE.find((c) => c.id === id);

// Categories available under a given exchange type.
export const categoriesForType = (typeId) =>
  CATEGORY_TREE.filter((c) => c.exchange_types.includes(typeId));

export const EXCHANGE_LOCATIONS = ['local', 'national', 'international', 'online'];