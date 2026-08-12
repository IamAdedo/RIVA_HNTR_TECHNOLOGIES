import React from 'react';

export type ConditionType = 'NEW' | 'UK_USED_GRADE_A' | 'UK_USED_GRADE_B' | 'SECOND_HAND';

interface ConditionBadgeProps {
  condition: ConditionType;
  className?: string;
}

export default function ConditionBadge({ condition, className = '' }: ConditionBadgeProps) {
  const getDetails = (cond: ConditionType) => {
    switch (cond) {
      case 'NEW':
        return {
          text: 'Brand New',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'UK_USED_GRADE_A':
        return {
          text: 'UK Used - Grade A',
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
      case 'UK_USED_GRADE_B':
        return {
          text: 'UK Used - Grade B',
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'SECOND_HAND':
        return {
          text: 'Local Second Hand',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      default:
        return {
          text: cond,
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        };
    }
  };

  const details = getDetails(condition);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${details.bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {details.text}
    </span>
  );
}
