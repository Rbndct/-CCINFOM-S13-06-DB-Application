import { 
  Heart, 
  Users, 
  Home, 
  Crown, 
  UserCheck, 
  Smile, 
  Baby, 
  UserCog,
  Briefcase,
  Package,
  MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type TableCategory = 
  | 'couple' 
  | 'guest' 
  | 'family' 
  | 'VIP' 
  | 'entourage' 
  | 'friends' 
  | 'kids' 
  | 'elderly' 
  | 'vendor' 
  | 'staff'
  | 'reserved'
  | 'special_needs'
  | 'General';

export const getTableCategoryIcon = (category: string) => {
  const normalizedCategory = category?.trim().toLowerCase() || '';
  switch (normalizedCategory) {
    case 'couple':
      return Heart;
    case 'guest':
      return Users;
    case 'family':
      return Home;
    case 'vip':
      return Crown;
    case 'entourage':
      return UserCheck;
    case 'friends':
      return Smile;
    case 'kids':
      return Baby;
    case 'elderly':
      return UserCog;
    case 'vendor':
      return Briefcase;
    case 'staff':
      return Package;
    case 'reserved':
      return MapPin;
    case 'special_needs':
      return UserCog;
    default:
      return Users;
  }
};

export const getTableCategoryColor = (category: string) => {
  const normalizedCategory = category?.trim().toLowerCase() || '';
  switch (normalizedCategory) {
    case 'couple':
      return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700';
    case 'guest':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
    case 'family':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
    case 'vip':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
    case 'entourage':
      return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700';
    case 'friends':
      return 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-700';
    case 'kids':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
    case 'elderly':
      return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
    case 'vendor':
      return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700';
    case 'staff':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    case 'reserved':
      return 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-700';
    case 'special_needs':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
  }
};

export const TableCategoryBadge = ({ category, showIcon = true, className = '' }: { 
  category: string; 
  showIcon?: boolean;
  className?: string;
}) => {
  const Icon = getTableCategoryIcon(category);
  const colorClass = getTableCategoryColor(category);
  const displayName = category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  
  return (
    <Badge className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass} ${className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{displayName}</span>
    </Badge>
  );
};

