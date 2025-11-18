import { 
  Utensils, 
  ChefHat,
  IceCream, 
  GlassWater
} from 'lucide-react';

export type MenuType = 
  | 'Appetizer' 
  | 'Main Course' 
  | 'Dessert' 
  | 'Beverage';

export const getMenuTypeIcon = (type: string) => {
  const normalizedType = type?.trim() || '';
  switch (normalizedType.toLowerCase()) {
    case 'appetizer':
      return Utensils;
    case 'main course':
      return ChefHat;
    case 'dessert':
      return IceCream;
    case 'beverage':
      return GlassWater;
    default:
      return Utensils;
  }
};

export const getMenuTypeColor = (type: string) => {
  const normalizedType = type?.trim() || '';
  switch (normalizedType.toLowerCase()) {
    case 'appetizer':
      return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
    case 'main course':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
    case 'dessert':
      return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700';
    case 'beverage':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
  }
};

export const MenuTypeBadge = ({ type, showIcon = true, className = '' }: { 
  type: string; 
  showIcon?: boolean;
  className?: string;
}) => {
  const Icon = getMenuTypeIcon(type);
  const colorClass = getMenuTypeColor(type);
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass} ${className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{type}</span>
    </span>
  );
};

