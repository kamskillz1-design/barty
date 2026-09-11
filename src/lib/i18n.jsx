import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    _dir: 'ltr',
    appName: 'iBarti',
    tagline: 'Exchange goods and services, no money needed',
    nav: { explore: 'Explore', myListings: 'My Listings', trades: 'Trades', hubs: 'Hubs', profile: 'Profile' },
    local: { title: 'Near you', viewAll: 'Browse all', sub: 'Listings in your area. Use the search to explore anywhere worldwide.', empty: 'No listings in your area yet — set your city in Profile to see local items.' },
    impact: { global: 'Items traded worldwide', globalSub: 'Live community counter', section: 'Your impact', sectionSub: 'The good you have created through bartering', itemsKeptOut: 'Items kept out of landfills', hoursSaved: 'Bartering hours saved', tradesCompleted: 'Trades completed' },
    hubs: { title: 'Safe Exchange Hubs', sub: 'Verified public spaces to meet and complete trades in person', suggest: 'Suggest a spot', name: 'Spot name', type: 'Type', country: 'Country', city: 'City', address: 'Address / notes', save: 'Submit', cancel: 'Cancel', verified: 'Verified', notVerified: 'Pending review', empty: 'No hubs yet — suggest the first safe spot in your area.', types: { library: 'Library', community_center: 'Community center', public_square: 'Public square', police_station: 'Police station', market: 'Market', other: 'Other' }, disclaimer: 'These locations are suggested by your community for safety. Always meet in open, well-lit, public areas.', vote: 'Confirm safe', voted: 'Confirmed', verifiedOnly: 'Verified hubs only', votesLabel: 'confirmations', thresholdHint: 'Spots are marked verified after 3 community confirmations.', locating: 'Locating you…', useLocation: 'Use my location' },
    search: { placeholder: 'Search listings...', location: 'Location', radius: 'Radius (km)', allLocations: 'All countries', allLanguages: 'All languages', anyTown: 'All cities', language: 'Language', town: 'Town', category: 'Category', allCategories: 'All categories', type: 'Type', allTypes: 'All', goods: 'Goods', services: 'Services', intent: 'Intent', allIntents: 'All', offerings: 'Offerings', seekings: 'Requests', search: 'Search', searchLang: 'Search languages...', clear: 'Clear' },
    categories: { electronics: 'Electronics', computers: 'Computers', phones: 'Phones', camera: 'Cameras & Photo', audio: 'Audio & Sound', gaming: 'Gaming', furniture: 'Furniture', home: 'Home & Decor', kitchen: 'Kitchenware', garden: 'Garden', tools: 'Tools', appliances: 'Appliances', clothing: 'Clothing', footwear: 'Footwear', accessories: 'Accessories', jewelry: 'Jewelry', beauty: 'Beauty', books: 'Books', media: 'Movies & Music', music: 'Instruments', art: 'Art', crafts: 'Crafts', collectibles: 'Collectibles', sports: 'Sports', fitness: 'Fitness', outdoors: 'Outdoors', bicycles: 'Bicycles', vehicles: 'Vehicles', toys: 'Toys', baby: 'Baby', kids: 'Kids', pets: 'Pets', office: 'Office & Stationery', agriculture: 'Agriculture', food: 'Food & Groceries', repairs: 'Repairs', maintenance: 'Maintenance', cleaning: 'Cleaning', transport: 'Transport', moving: 'Moving Help', cooking: 'Cooking', tutoring: 'Tutoring', languages: 'Languages', music_lessons: 'Music Lessons', design: 'Design', writing: 'Writing', translation: 'Translation', it_services: 'IT Services', consulting: 'Consulting', marketing: 'Marketing', photo_video: 'Photo & Video', events: 'Events', travel: 'Travel', health: 'Health', wellness: 'Wellness', other: 'Other' },
    listing: { new: 'New Listing', title: 'Title', description: 'Description', intent: 'I am', offering: 'Offering', seeking: 'Seeking', offeringHint: 'I am offering this good or service', seekingHint: 'I am looking for this good or service', seekingField: 'What I am looking for', seekingPlaceholder: 'Search items or skills...', seekingAdd: 'Add', lookingFor: 'Looking for', returnMode: 'What do you want in return?', modeSpecific: 'Looking for something specific', modeAnything: 'Open to Anything', modeAnythingHint: 'Accept any fair counter-offer — leave the specifics open.', modeSpecificHint: 'Describe what you want in return.', openToAnything: 'Open to Offers / Anything!', seekingAnythingBadge: 'Open to Anything', openToAnythingDesc: 'This owner is open to any fair exchange. Offer one of your own listings to start a trade.', type: 'Type', good: 'Good', service: 'Service', category: 'Category', country: 'Country', city: 'City / Town', town: 'Village / Area', language: 'Language', images: 'Images', addImage: 'Add image URL', save: 'Save Listing', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', back: 'Back', by: 'By', location: 'Location', proposeTrade: 'Propose Trade', fulfillRequest: 'Offer this', counterOffer: 'Offer Your Listing', myListing: 'Your listing', propose: 'Propose', valueHint: 'Fairness is calculated internally — no prices are ever shown.', contact: 'Contact', noImages: 'No images yet', have: 'I Have', want: 'I Want', haveLabel: 'I have', wantLabel: 'I want', exchangeType: 'Exchange Type', exchangeLocation: 'Exchange Location', openAnythingEditor: 'Open to Anything', openAnythingEditorHint: 'Accept any fair exchange — leave the WANT side open.', subcategory: 'Subcategory', selectType: 'Select type', selectCategory: 'Select category', selectSubcategory: 'Select subcategory (optional)', otherCategory: 'Other', otherSubcategory: 'Other' },
    exchType: { goods: 'Goods', services: 'Services', digital: 'Digital' },
    exchLoc: { local: 'Local', national: 'National', international: 'International', online: 'Online' },
    tags: { label: 'Tags', placeholder: 'Add a tag…', add: 'Add', hint: 'Add keywords to help people find this listing.' },
    trade: { title: 'Trades', empty: 'No trades yet', youOffered: 'You offered', youRequested: 'You requested', status: { pending: 'Pending', accepted: 'Accepted', completed: 'Completed', cancelled: 'Cancelled' }, accept: 'Accept', decline: 'Decline', markComplete: 'Mark as Completed', cancel: 'Cancel Trade', chat: 'Conversation', messages: 'Messages', send: 'Send', typeMessage: 'Type a message...', completeConfirm: 'Only mark complete after you have met in person and inspected the exchange.', bothComplete: 'Both parties must confirm completion', leaveReview: 'Leave a Review', rating: 'Rating', comment: 'Comment', recommend: 'Recommend this user', submitReview: 'Submit Review', reviewLeft: 'Review submitted', offered: 'Offered', requested: 'Requested', safeSpot: 'Meetup safe hub', chooseSpot: 'Choose a verified hub for the exchange', spotSaved: 'Safe hub saved', noSpots: 'No verified hubs yet' },
    call: { video: 'Video', voice: 'Voice Only', incoming: 'Incoming call', connecting: 'Connecting…', connected: 'Connected', ended: 'Call ended', missed: 'Missed call', declined: 'Call declined', accept: 'Accept', decline: 'Decline', endCall: 'End call', mute: 'Mute', unmute: 'Unmute', videoOn: 'Camera on', videoOff: 'Camera off', noWebrtc: 'Your browser does not support live calls.', permissionError: 'Camera or microphone access is required. Allow access in your browser settings and try again.', startedVideo: '{name} started a video call', startedVoice: '{name} started a voice call', endedVideo: '{name} ended the video call', endedVoice: '{name} ended the voice call', missedVideo: 'Missed video call from {name}', missedVoice: 'Missed voice call from {name}', declinedVideo: '{name} declined the video call', declinedVoice: '{name} declined the voice call', callBack: 'Call back', callLabel: 'Call', startVideo: 'Video call', startVoice: 'Voice call', joinCall: 'Join Call', blockCaller: 'Block caller', confirmBlock: 'Block this caller? They won\'t be able to call or see you again.', confirmBlockUser: 'Block this user? They won\'t be able to see your listings or contact you.', blockUser: 'Block user', unblock: 'Unblock', blocked: 'User blocked', blockedUsers: 'Blocked users', noBlocked: 'You haven\'t blocked anyone.', youBlocked: 'You can\'t call or message this user — one of you has blocked the other.', loadError: 'Call service unavailable. Please try again.', permissionDeniedTitle: 'Camera & microphone needed', permissionDeniedBody: 'Allow camera and microphone access in your browser settings to join the call.', profileUnavailable: 'This profile is not available.' },
    value: { fair: 'Fair Exchange', balanced: 'Well Balanced', slightlyUnbalanced: 'Slightly Unbalanced', unbalanced: 'Unbalanced Exchange', explanation: 'This is a non-monetary fairness indicator. No cash values are involved.' },
    safety: { title: 'Stay Safe', body: 'Always meet in a public place and inspect goods or services thoroughly in person before finalizing. Exchanges are final once you complete the trade in person.' },
    profile: { title: 'Profile', language: 'Language', country: 'Country', city: 'City / Town', town: 'Village / Area', bio: 'Bio', save: 'Save Profile', saved: 'Saved', saveError: 'Save failed — please try again.', myListings: 'My Listings', reviews: 'Reviews', logout: 'Log out', noListings: 'You have no listings yet', noReviews: 'No reviews yet', createListing: 'Create a listing', verified: 'Verified', notVerified: 'Not verified', verify: 'Verify Official ID', verifyTitle: 'Verify your identity', verifyDesc: 'Confirm your identity with an official document. This unlocks the verified badge on your profile.', legalName: 'Full legal name', docType: 'Document type', dtPassport: 'Passport', dtNationalID: 'National ID card', dtLicense: 'Driver\'s license', dtResPermit: 'Residence permit', docNumber: 'Document number', issuingCountry: 'Issuing country', ack: 'I confirm this information is accurate.', verifyNow: 'Verify now', verifying: 'Verifying...', verifySuccess: 'Identity verified!', verifyError: 'Verification failed. Please try again.' },
    common: { loading: 'Loading...', empty: 'Nothing here yet', create: 'Create', close: 'Close', you: 'You', member: 'iBarti member', propose: 'Propose Trade' },
    v2: { suggestedTitle: 'Suggested for you', suggestedSub: 'Listings that match what you want', leaderboardTitle: 'Community leaderboard', leaderboardSub: 'Most completed trades this month', tradesCount: 'trades', onboardingTitle: 'Welcome to Barti — get started', onboardingStep1: 'Add your first listing', onboardingStep2: 'Get verified', onboardingStep3: 'Set your location', save: 'Save', savedTitle: 'Saved listings', savedEmpty: 'You haven\u2019t saved any listings yet', removeSaved: 'Remove from saved', counterTitle: 'Counter-offer', counterOfferBtn: 'Counter-offer', counterPickHint: 'Offer a different one of your listings instead of the requested one', counterMessage: 'Message (optional)', counterSent: 'Send counter-offer', counterSentNotice: 'Counter-offer sent — waiting for a response.', counterReceived: 'Counter-offer received', counterAccept: 'Accept counter-offer', counterDecline: 'Decline counter-offer', counterAccepted: 'Counter-offer accepted — trade updated', counterDeclined: 'Counter-offer declined', meetupTitle: 'Meetup time', meetupPropose: 'Propose time', meetupConfirm: 'Confirm time', meetupConfirmed: 'Confirmed', waitingConfirm: 'Waiting for the other side to confirm', receiptTitle: 'Trade receipt', receiptWhen: 'Completed', receiptWhere: 'Meetup spot', receiptCopy: 'Copy link', receiptCopied: 'Link copied', receiptPrint: 'Print', reportUser: 'Report user', reportTitle: 'Report this user', reportReason: 'Reason', reportNote: 'Details (optional)', reportSubmit: 'Submit report', reportSent: 'Thank you — your report has been submitted for review.', reasons: { harassment: 'Harassment', scam: 'Scam or fraud', inappropriate: 'Inappropriate behavior', other: 'Other' }, verified: 'Verified', newTrader: 'New trader', verifyTitle: 'Verification', verifyDesc: 'Verify your account to get a trusted badge next to your name on listings, profiles and chats.', verifyBtn: 'Request verification', verifyRequested: 'Verification requested — pending review', verifyApproved: 'Your identity is verified', verifyRejected: 'Verification declined — you can request again', notifTitle: 'Email notifications', notifSub: 'Get an email when you receive trade proposals, messages, and counter-offers', notifOn: 'On', notifOff: 'Off', adminReports: 'User reports', adminReportsEmpty: 'No reports — the community is thriving', markReviewed: 'Mark reviewed', markResolved: 'Mark resolved', stillAvailableTitle: 'Still offering this?', stillAvailableHint: 'This listing has not been confirmed in a while. Confirm it stays visible in Explore.', stillAvailableBtn: 'Yes, still available', stillAvailableDone: 'Thanks — confirmed as active.' },
    community: { comments: { title: 'Comments', empty: 'No comments yet. Start the conversation.', placeholder: 'Write a comment…', post: 'Post', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', edited: 'edited', loginToComment: 'Log in to leave a comment' }, flag: { button: 'Report', title: 'Report this listing', subtitle: 'Help keep iBarti safe. Reports are reviewed by moderators.', reasons: { spam: 'Spam', inappropriate: 'Inappropriate', misleading: 'Misleading', other: 'Other' }, notePlaceholder: 'Add a note (optional)', submit: 'Submit report', submitting: 'Submitting…', submitted: 'Thank you — this listing has been reported for review.', already: 'You have already reported this listing.', hiddenNotice: 'This listing has been hidden pending moderator review.' }, reviews: { title: 'Reviews Received', empty: 'No reviews yet', average: 'Average rating', basedOn: 'based on {n} review(s)', listings: 'Listings', reviewsTab: 'Reviews Received' } },
    landing: { hero: 'Trade anything, anywhere — without money', sub: 'iBarti connects people worldwide to exchange goods and services through fair bartering across countries, cities, and villages.', cta: 'Start Exploring', feature1: 'Goods & Services', feature1d: 'List physical items or skills you can offer.', feature2: 'Smart Matching', feature2d: 'A built-in fairness engine keeps exchanges balanced.', feature3: 'Global & Local', feature3d: 'Find barters near you or across the world.' }
  }
};

// Languages written right-to-left; everything else is treated as LTR.
const RTL_CODES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'dv', 'ug', 'ks']);

// Comprehensive list of UI languages shown in the picker.
// GTranslate does the actual on-page translation; this list only drives the buttons.
const UI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'ar', label: 'Arabic' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ru', label: 'Russian' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'pl', label: 'Polish' },
  { code: 'cs', label: 'Czech' },
  { code: 'sk', label: 'Slovak' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'ro', label: 'Romanian' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'sr', label: 'Serbian' },
  { code: 'hr', label: 'Croatian' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'mk', label: 'Macedonian' },
  { code: 'sq', label: 'Albanian' },
  { code: 'el', label: 'Greek' },
  { code: 'tr', label: 'Turkish' },
  { code: 'da', label: 'Danish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'nb', label: 'Norwegian' },
  { code: 'fi', label: 'Finnish' },
  { code: 'is', label: 'Icelandic' },
  { code: 'et', label: 'Estonian' },
  { code: 'lv', label: 'Latvian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'be', label: 'Belarusian' },
  { code: 'ca', label: 'Catalan' },
  { code: 'eu', label: 'Basque' },
  { code: 'gl', label: 'Galician' },
  { code: 'cy', label: 'Welsh' },
  { code: 'ga', label: 'Irish' },
  { code: 'mt', label: 'Maltese' },
  { code: 'he', label: 'Hebrew' },
  { code: 'fa', label: 'Persian' },
  { code: 'ps', label: 'Pashto' },
  { code: 'ur', label: 'Urdu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ne', label: 'Nepali' },
  { code: 'th', label: 'Thai' },
  { code: 'lo', label: 'Lao' },
  { code: 'km', label: 'Khmer' },
  { code: 'my', label: 'Burmese' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ms', label: 'Malay' },
  { code: 'tl', label: 'Filipino' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'mn', label: 'Mongolian' },
  { code: 'kk', label: 'Kazakh' },
  { code: 'uz', label: 'Uzbek' },
  { code: 'az', label: 'Azerbaijani' },
  { code: 'ka', label: 'Georgian' },
  { code: 'hy', label: 'Armenian' },
  { code: 'sw', label: 'Swahili' },
  { code: 'am', label: 'Amharic' },
  { code: 'so', label: 'Somali' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'zu', label: 'Zulu' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'mg', label: 'Malagasy' },
  { code: 'ht', label: 'Haitian Creole' },
  { code: 'mi', label: 'Maori' },
  { code: 'sm', label: 'Samoan' }
];

const detectDir = (code) => (RTL_CODES.has(code) ? 'rtl' : 'ltr');

// A few of our codes don't match Google's exact code for that language.
const GOOGLE_CODE_OVERRIDES = {
  zh: 'zh-CN',
  nb: 'no',
  he: 'iw'
};
const toGoogleCode = (code) => GOOGLE_CODE_OVERRIDES[code] || code;

const I18nContext = createContext();

// localStorage key that remembers the user's chosen language across visits.
const LANG_PREF_KEY = 'ibarti_lang_pref';

const readStoredLang = () => {
  try { return localStorage.getItem(LANG_PREF_KEY) || 'en'; } catch { return 'en'; }
};

// Calls GTranslate's own switch function once it has finished loading.
const triggerGTranslate = (googleCode, attemptsLeft = 8) => {
  if (typeof window.doGTranslate === 'function') {
    window.doGTranslate(`en|${googleCode}`);
    return;
  }
  if (attemptsLeft <= 0) return;
  setTimeout(() => triggerGTranslate(googleCode, attemptsLeft - 1), 500);
};

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => readStoredLang());
  const [t] = useState(() => translations.en);

  const dir = detectDir(lang);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  useEffect(() => {
    const stored = readStoredLang();
    if (stored && stored !== 'en') {
      triggerGTranslate(toGoogleCode(stored));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (code) => {
    setLangState(code);
    try { localStorage.setItem(LANG_PREF_KEY, code); } catch { /* storage blocked */ }
    triggerGTranslate(toGoogleCode(code));
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

export const LANGUAGES = UI_LANGUAGES;

export { translations };
