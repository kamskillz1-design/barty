// Shared moderation config — imported by submitFlag and reportUser so the
// thresholds/duration live in one tunable place.
export const LISTING_HIDE_THRESHOLD = 3;
export const USER_SUSPEND_THRESHOLD = 5;
export const SUSPEND_DURATION_HOURS = 72;
export const FLAG_REASONS = ['spam', 'inappropriate', 'misleading', 'other'];