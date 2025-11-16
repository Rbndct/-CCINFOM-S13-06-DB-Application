import { 
  Package, 
  Sparkles, 
  Crown, 
  Star,
  Gift
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type PackageType = 
  | 'Full Service' 
  | 'Basic' 
  | 'Premium' 
  | 'Specialty';

export const getPackageTypeIcon = (type: string) => {
  const normalizedType = type?.trim() || '';
  switch (normalizedType) {
    case 'Full Service':
      return Package;
    case 'Basic':
      return Gift;
    case 'Premium':
      return Crown;
    case 'Specialty':
      return Sparkles;
    default:
      return Star;
  }
};

export const getPackageTypeColor = (type: string) => {
  const normalizedType = type?.trim() || '';
  switch (normalizedType) {
    case 'Full Service':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
    case 'Basic':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
    case 'Premium':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
    case 'Specialty':
      return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
  }
};

export const PackageTypeBadge = ({ type, showIcon = true, className = '' }: { 
  type: string; 
  showIcon?: boolean;
  className?: string;
}) => {
  const Icon = getPackageTypeIcon(type);
  const colorClass = getPackageTypeColor(type);
  
  return (
    <Badge className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass} ${className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{type || 'Standard'}</span>
    </Badge>
  );
};

