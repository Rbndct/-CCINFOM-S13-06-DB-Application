// Application constants

// Menu item types
export const MENU_TYPES = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Beverage'
] as const;

// Package types
export const PACKAGE_TYPES = [
  'Full Service',
  'Basic',
  'Premium',
  'Specialty'
] as const;

// RSVP statuses
export const RSVP_STATUSES = [
  'pending',
  'accepted',
  'confirmed',
  'declined'
] as const;

// Payment statuses
export const PAYMENT_STATUSES = [
  'pending',
  'partial',
  'paid',
  'overdue'
] as const;

// Table categories
export const TABLE_CATEGORIES = [
  'Guest',
  'Couple',
  'Family',
  'VIP',
  'Entourage',
  'Friends',
  'Kids',
  'Elderly',
  'Vendor',
  'Staff',
  'Reserved',
  'Special Needs'
] as const;

// Dietary restriction types
export const RESTRICTION_TYPES = [
  'Dietary',
  'Medical',
  'Allergy',
  'Religious',
  'Intolerance'
] as const;

// Severity levels
export const SEVERITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical'
] as const;

// Pagination
export const ITEMS_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;

// Currency
export const DEFAULT_CURRENCY = 'PHP';
export const CURRENCY_SYMBOL = '₱';

