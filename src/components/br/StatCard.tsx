'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export function StatCard({ label, value, sublabel, icon, accentColor }: StatCardProps) {
  const isNumeric = typeof value === 'number';
  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : 0);
  const rafRef = useRef<number | null>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (typeof value !== 'number') return;

    // Reset if value changed
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
    }

    const target = value;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value]);

  const renderedValue = isNumeric
    ? (Number.isInteger(displayValue) ? displayValue.toFixed(0) : displayValue.toFixed(1))
    : value;

  return (
    <Card className="relative border-border bg-card group transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 overflow-hidden">
      {/* Accent border */}
      {accentColor && (
        <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full ${accentColor}`} />
      )}
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground leading-tight">{renderedValue}</p>
            {sublabel && (
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{sublabel}</p>
            )}
          </div>
          {icon && (
            <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-200">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
