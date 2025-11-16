import { 
  UserCheck, 
  AlertTriangle,
  Leaf,
  Wheat,
  Heart,
  Shield,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Icon mapping for restriction types
export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Dietary':
      return <Leaf className="h-4 w-4" />;
    case 'Medical':
      return <Heart className="h-4 w-4" />;
    case 'Allergy':
      return <AlertTriangle className="h-4 w-4" />;
    case 'Religious':
      return <Shield className="h-4 w-4" />;
    case 'Intolerance':
      return <Wheat className="h-4 w-4" />;
    default:
      return <UserCheck className="h-4 w-4" />;
  }
};

// Color mapping for restriction types
export const getTypeColor = (type: string) => {
  switch (type) {
    case 'Dietary':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Medical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Allergy':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Religious':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Intolerance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Severity badge with color intensity
export const getSeverityBadge = (severity: string) => {
  const severityConfig = {
    'Critical': {
      bg: 'bg-red-600',
      text: 'text-white',
      border: 'border-red-700',
      icon: <AlertTriangle className="w-3 h-3 mr-1" />,
    },
    'High': {
      bg: 'bg-orange-500',
      text: 'text-white',
      border: 'border-orange-600',
      icon: <AlertTriangle className="w-3 h-3 mr-1" />,
    },
    'Moderate': {
      bg: 'bg-yellow-400',
      text: 'text-yellow-900',
      border: 'border-yellow-500',
      icon: <Info className="w-3 h-3 mr-1" />,
    },
    'Low': {
      bg: 'bg-green-400',
      text: 'text-green-900',
      border: 'border-green-500',
      icon: <UserCheck className="w-3 h-3 mr-1" />,
    },
  };

  const config = severityConfig[severity as keyof typeof severityConfig] || {
    bg: 'bg-gray-400',
    text: 'text-gray-900',
    border: 'border-gray-500',
    icon: <Info className="w-3 h-3 mr-1" />,
  };

  return (
    <Badge className={`${config.bg} ${config.text} ${config.border} border flex items-center w-fit`}>
      {config.icon}
      {severity}
    </Badge>
  );
};

// Format restrictions list for display
export const formatRestrictionsList = (restrictions: Array<{
  restriction_name: string;
  restriction_type?: string;
  severity_level?: string;
}>, maxDisplay: number = 3): string => {
  if (!restrictions || restrictions.length === 0) {
    return 'No restrictions';
  }
  
  const names = restrictions.map(r => r.restriction_name);
  if (names.length <= maxDisplay) {
    return names.join(', ');
  }
  
  return `${names.slice(0, maxDisplay).join(', ')} +${names.length - maxDisplay} more`;
};

// Get restriction count text
export const getRestrictionCountText = (count: number): string => {
  if (count === 0) return 'No restrictions';
  if (count === 1) return '1 restriction';
  return `${count} restrictions`;
};

// Type definition for dietary restrictions
export type DietaryRestriction = {
  restriction_id: number;
  restriction_name: string;
  restriction_type?: string;
  severity_level?: string;
};

// Get the "None" restriction ID from a list of restrictions
export const getNoneRestrictionId = (restrictions: DietaryRestriction[]): number | null => {
  const noneRestriction = restrictions.find(r => r.restriction_name === 'None');
  return noneRestriction?.restriction_id || null;
};

// Ensure "None" restriction is added if restriction array is empty
export const ensureNoneRestriction = (restrictionIds: number[], noneId: number | null): number[] => {
  if (restrictionIds.length === 0 && noneId !== null) {
    return [noneId];
  }
  // If there are other restrictions, ensure "None" is not included
  return restrictionIds.filter(id => id !== noneId);
};

// Filter "None" from display lists (for dropdowns, tables, etc.)
export const filterNoneFromDisplay = (restrictions: DietaryRestriction[]): DietaryRestriction[] => {
  return restrictions.filter(r => r.restriction_name !== 'None');
};

