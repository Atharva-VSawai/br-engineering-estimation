'use client';

import React from 'react';
import type { ComplexityLevel } from '@/types';

const STYLES: Record<ComplexityLevel, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  'Very High': 'bg-red-50 text-red-700 border-red-200',
};

interface ComplexityBadgeProps {
  level: ComplexityLevel;
  className?: string;
}

export function ComplexityBadge({ level, className = '' }: ComplexityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${STYLES[level]} ${className}`}
    >
      {level}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Review': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-200'} ${className}`}
    >
      {status}
    </span>
  );
}
