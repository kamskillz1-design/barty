// iBarti V1 Exchange-Type architecture.
// Three top-level Exchange Types; a 12-category V1 tree under them; each
// category declares which exchange types it belongs to and its subcategories.

export const EXCHANGE_TYPES = [
  { id: 'goods', icon: '📦' },
  { id: 'services', icon: '🛠' },
  { id: 'digital', icon: '💻' }
];

export const EXCHANGE_TYPE_IDS = EXCHANGE_TYPES.map((x) => x.id);

// 12-category V1 tree.
// `exchange_types` lists which top-level types a category can appear under.
// `subcategories` is the ordered list of V1 subcategory display names.
export const CATEGORY_TREE = [
  {
    id: 'electronics_technology',
    exchange_types: ['goods', 'digital'],
    subcategories: ['Phones', 'Computers', 'Cameras', 'Audio', 'Gaming', 'Smart Devices', 'Accessories']
  },
  {
    id: 'home_furniture',
    exchange_types: ['goods'],
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Appliances', 'Lighting', 'Tools', 'Garden Equipment']
  },
  {
    id: 'fashion_personal',
    exchange_types: ['goods'],
    subcategories: ['Clothing', 'Shoes', 'Bags', 'Watches', 'Jewelry', 'Vintage']
  },
  {
    id: 'books_education',
    exchange_types: ['goods', 'digital'],
    subcategories: ['Books', 'Textbooks', 'Study Materials', 'Educational Toys', 'Courses']
  },
  {
    id: 'creative_design',
    exchange_types: ['services', 'digital'],
    subcategories: ['Graphic Design', 'Illustration', 'Photography', 'Video', 'Animation', 'Writing', 'Music']
  },
  {
    id: 'digital_online_services',
    exchange_types: ['services', 'digital'],
    subcategories: ['Web Development', 'App Development', 'SEO', 'Digital Marketing', 'Social Media', 'Virtual Assistance']
  },
  {
    id: 'repairs_practical',
    exchange_types: ['services'],
    subcategories: ['Electrical', 'Plumbing', 'Carpentry', 'Electronics Repair', 'Computer Repair', 'Vehicle Repair', 'Handyman']
  },
  {
    id: 'business_professional',
    exchange_types: ['services', 'digital'],
    subcategories: ['Consulting', 'Marketing', 'Accounting', 'Legal', 'HR', 'Translation', 'Research']
  },
  {
    id: 'vehicles_transport',
    exchange_types: ['goods', 'services'],
    subcategories: ['Cars', 'Motorcycles', 'Bicycles', 'Auto Parts', 'Transport Services']
  },
  {
    id: 'sports_hobbies',
    exchange_types: ['goods'],
    subcategories: ['Sports Equipment', 'Fitness', 'Outdoor & Camping', 'Collectibles', 'Musical Instruments']
  },
  {
    id: 'collectibles_vintage',
    exchange_types: ['goods'],
    subcategories: ['Stamps', 'Coins', 'Antiques', 'Memorabilia', 'Vintage Electronics', 'Trading Cards']
  },
  {
    id: 'food_garden_homemade',
    exchange_types: ['goods'],
    subcategories: ['Baked Goods', 'Preserves', 'Plants', 'Seeds', 'Home-Grown Produce']
  }
];

export const CATEGORY_IDS = CATEGORY_TREE.map((c) => c.id);

export const getCategory = (id) => CATEGORY_TREE.find((c) => c.id === id);

// Categories available under a given exchange type.
export const categoriesForType = (typeId) =>
  CATEGORY_TREE.filter((c) => c.exchange_types.includes(typeId));

export const EXCHANGE_LOCATIONS = ['local', 'national', 'international', 'online'];