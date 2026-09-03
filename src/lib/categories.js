// iBarti V2 category taxonomy.
//
// A single authoritative, hierarchical configuration: three top-level Exchange
// Type domains (Goods / Services / Digital), each containing a fixed set of
// child categories that together cover the full range of human trade.
// `src/lib/categories.js` is the single source of truth — every dropdown,
// filter, form, and validator imports from here instead of using inline
// string literals.
//
// Adding a category later is a non-destructive change: append a new entry to
// CATEGORY_TREE and (optionally) its subcategories, then add a label to the
// i18n `v1cat` block. No UI code needs to change.
//
// Legacy V1 category ids are NOT listed here anymore (the V1 set, including
// the removed "Other & Mixed Lots", is gone). Legacy listings still resolve
// their labels because categoryLabel() reads the i18n `v1cat` dictionary
// first, which still carries the legacy Spanish labels for backward display.

export const EXCHANGE_TYPES = [
  { id: 'goods', icon: '📦' },
  { id: 'services', icon: '🛠' },
  { id: 'digital', icon: '💻' }
];

export const EXCHANGE_TYPE_IDS = EXCHANGE_TYPES.map((x) => x.id);

// V2 category tree — each category belongs to exactly one Exchange Type
// domain (its parent). `subcategories` is left extensible (empty by default);
// the form still offers the generic "Other" subcategory sentinel.
export const CATEGORY_TREE = [
  // ── Goods (Bienes - Physical items) ──
  { id: 'goods_food_agriculture', exchange_types: ['goods'], subcategories: [] },
  { id: 'goods_clothing_textiles_footwear', exchange_types: ['goods'], subcategories: [] },
  { id: 'goods_tools_machinery_hardware', exchange_types: ['goods'], subcategories: [] },
  { id: 'goods_household_furniture_appliances', exchange_types: ['goods'], subcategories: [] },
  { id: 'goods_books_education_culture', exchange_types: ['goods'], subcategories: [] },
  { id: 'goods_raw_materials_construction_scrap', exchange_types: ['goods'], subcategories: [] },
  { id: 'goods_health_personal_care_hygiene', exchange_types: ['goods'], subcategories: [] },
  { id: 'goods_other', exchange_types: ['goods'], subcategories: [] },

  // ── Services (Servicios - Human labor & physical skills) ──
  { id: 'services_construction_repair_maintenance', exchange_types: ['services'], subcategories: [] },
  { id: 'services_transport_logistics_deliveries', exchange_types: ['services'], subcategories: [] },
  { id: 'services_caregiving_wellbeing_health', exchange_types: ['services'], subcategories: [] },
  { id: 'services_education_tutoring_language', exchange_types: ['services'], subcategories: [] },
  { id: 'services_agriculture_gardening_landscaping', exchange_types: ['services'], subcategories: [] },
  { id: 'services_kitchen_catering_events', exchange_types: ['services'], subcategories: [] },
  { id: 'services_professional_legal_admin', exchange_types: ['services'], subcategories: [] },
  { id: 'services_other', exchange_types: ['services'], subcategories: [] },

  // ── Online/Digital (Trabajo en línea/Digital) ──
  { id: 'digital_web_software_tech', exchange_types: ['digital'], subcategories: [] },
  { id: 'digital_translation_copywriting', exchange_types: ['digital'], subcategories: [] },
  { id: 'digital_graphic_design_creative', exchange_types: ['digital'], subcategories: [] },
  { id: 'digital_consulting_marketing_strategy', exchange_types: ['digital'], subcategories: [] },
  { id: 'digital_multimedia_audio_video', exchange_types: ['digital'], subcategories: [] },
  { id: 'digital_files_guides_learning', exchange_types: ['digital'], subcategories: [] },
  { id: 'digital_other', exchange_types: ['digital'], subcategories: [] }
];

export const CATEGORY_IDS = CATEGORY_TREE.map((c) => c.id);

export const getCategory = (id) => CATEGORY_TREE.find((c) => c.id === id);

// Categories available under a given exchange type (domain).
export const categoriesForType = (typeId) =>
  CATEGORY_TREE.filter((c) => c.exchange_types.includes(typeId));

// Full i18n key for a subcategory (stable, stored on the listing).
export const subcatKey = (categoryId, subSlug) => `${categoryId}__${subSlug}`;

// Sentinel stored on listings when the user picks the generic "Other"
// fallback at either the category or the subcategory level.
export const OTHER_KEY = '__other';

// Resolve a stored category id into the current UI language's label,
// including the "Other" sentinel and legacy free-form text.
export const categoryLabel = (t, catId) => {
  if (!catId) return '';
  if (t.v1cat && t.v1cat[catId]) return t.v1cat[catId];
  if (catId === OTHER_KEY) return (t.listing && t.listing.otherCategory) || 'Other';
  return catId;
};

// Resolve a stored subcategory value into the current UI language's label.
// Handles the "Other" sentinel, localizable keys, and legacy free-form text.
export const subcatLabel = (t, stored) => {
  if (!stored) return '';
  if (stored === OTHER_KEY) return (t.listing && t.listing.otherSubcategory) || 'Other';
  if (t.v1sub && t.v1sub[stored]) return t.v1sub[stored];
  return stored;
};

export const EXCHANGE_LOCATIONS = ['local', 'national', 'international', 'online'];