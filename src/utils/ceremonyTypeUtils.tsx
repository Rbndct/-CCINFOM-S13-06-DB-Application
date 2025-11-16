import { 
  Church, 
  Heart, 
  Sun, 
  Waves, 
  TreePine, 
  Home,
  Building2,
  Sparkles
} from 'lucide-react';

export type CeremonyType = 
  | 'Traditional' 
  | 'Modern' 
  | 'Outdoor' 
  | 'Civil' 
  | 'Church' 
  | 'Garden' 
  | 'Beach' 
  | 'Indoor';

export const getCeremonyTypeIcon = (type: string) => {
  const normalizedType = type?.trim() || '';
  switch (normalizedType.toLowerCase()) {
    case 'traditional':
      return Heart;
    case 'modern':
      return Sparkles;
    case 'outdoor':
      return TreePine;
    case 'civil':
      return Building2;
    case 'church':
      return Church;
    case 'garden':
      return Sun;
    case 'beach':
      return Waves;
    case 'indoor':
      return Home;
    default:
      return Heart;
  }
};

export const getCeremonyTypeColor = (type: string) => {
  const normalizedType = type?.trim() || '';
  switch (normalizedType.toLowerCase()) {
    case 'traditional':
      return 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-700';
    case 'modern':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
    case 'outdoor':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
    case 'civil':
      return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    case 'church':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
    case 'garden':
      return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700';
    case 'beach':
      return 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-700';
    case 'indoor':
      return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
  }
};

export const CeremonyTypeBadge = ({ type, showIcon = true, className = '' }: { 
  type: string; 
  showIcon?: boolean;
  className?: string;
}) => {
  const Icon = getCeremonyTypeIcon(type);
  const colorClass = getCeremonyTypeColor(type);
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass} ${className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{type}</span>
    </span>
  );
};

