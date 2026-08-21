'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  sparkline?: number[];
}

export function StatCard({ label, value, sublabel, icon, accentColor, sparkline }: StatCardProps) {
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

  const sparklinePath = useMemo(() => {
    if (!sparkline || sparkline.length < 2) return '';
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 20;
    const height = 12;
    const points = sparkline.map((v, i) => {
      const x = (i / (sparkline.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [sparkline]);

  return (
    <Card className="relative border-border bg-card group transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/[0.06] hover:border-primary/25 hover:-translate-y-1 hover:scale-[1.02] overflow-hidden">
      {/* Accent border */}
      {accentColor && (
        <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full ${accentColor}`} />
      )}
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
            <p className="mt-1.5 text-[2.25rem] font-extrabold text-foreground leading-none tabular-nums tracking-tight group-hover:text-primary/80 transition-colors duration-300">{renderedValue}</p>
            {sublabel && (
              <p className="mt-0.5 text-sm text-muted-foreground truncate">{sublabel}</p>
            )}
            {sparkline && sparkline.length >= 2 && sparklinePath && (
              <svg
                width="20"
                height="12"
                viewBox="0 0 20 12"
                className="mt-1 text-current opacity-40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d={sparklinePath} />
              </svg>
            )}
          </div>
          {icon && (
            <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary group-hover:scale-110 group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-300 shadow-sm">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
