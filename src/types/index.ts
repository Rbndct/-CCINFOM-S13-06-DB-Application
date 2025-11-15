// TypeScript type definitions for the application

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Wedding types
export interface Wedding {
  wedding_id: number;
  couple_id: number;
  guest_count?: number;
  total_cost?: number;
  production_cost?: number;
  venue: string;
  wedding_date: string;
  wedding_time: string;
  payment_status: string;
  preference_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Couple types
export interface Couple {
  couple_id: number;
  partner1_name: string;
  partner2_name: string;
  partner1_phone: string;
  partner2_phone: string;
  partner1_email: string;
  partner2_email: string;
  planner_contact: string;
  created_at?: string;
  updated_at?: string;
}

// Guest types
export interface Guest {
  guest_id: number;
  wedding_id: number;
  guest_name: string;
  table_id?: number;
  restriction_id?: number;
  rsvp_status: string;
  dietaryRestrictions?: DietaryRestriction[];
  created_at?: string;
  updated_at?: string;
}

// Dietary Restriction types
export interface DietaryRestriction {
  restriction_id: number;
  restriction_name: string;
  severity_level: string;
  restriction_type: string;
  created_at?: string;
  updated_at?: string;
}

// Table types
export interface SeatingTable {
  table_id: number;
  wedding_id: number;
  table_number?: string;
  table_category?: string;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
}

// Menu Item types
export interface MenuItem {
  menu_item_id: number;
  menu_name: string;
  menu_cost: number;
  menu_price: number;
  menu_type: string;
  stock: number;
  restriction_id?: number;
  restriction_name?: string;
  profit_margin?: number;
  usage_count?: number;
  recipe?: RecipeIngredient[];
}

// Package types
export interface Package {
  package_id: number;
  package_name: string;
  package_type: string;
  package_price: number;
  menu_items?: MenuItem[];
  total_items?: number;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Recipe types
export interface RecipeIngredient {
  recipe_id?: number;
  ingredient_id: number;
  ingredient_name: string;
  quantity_needed: number;
  unit: string;
  stock_quantity?: number;
  re_order_level?: string;
}

// Ingredient types
export interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  stock_quantity: number;
  re_order_level: string;
  created_at?: string;
  updated_at?: string;
}

