'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionCardProps {
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  accentColor?: string;
}

export function SectionCard({ title, description, children, action, className = '', noPadding, accentColor }: SectionCardProps) {
  return (
    <Card className={`group rounded-lg border border-border border-l-2 border-l-primary/30 bg-card transition-all duration-200 hover:shadow-sm hover:-translate-y-px hover:border-primary/20 overflow-hidden ${className}`}>
      <CardHeader className="pt-4 px-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && (
            <div className="shrink-0 ml-3 rounded-md bg-muted/50 p-1.5 hover:bg-muted transition">
              {action}
            </div>
          )}
        </div>
      </CardHeader>
      {/* Gradient line below header */}
      <div
        className="h-0.5 bg-gradient-to-r from-primary/60 via-primary/10 to-transparent group-hover:w-full transition-all duration-300 w-1/2"
        style={accentColor ? { background: `linear-gradient(to right, ${accentColor}66, ${accentColor}1a, transparent)` } : undefined}
      />
      {noPadding ? children : <CardContent className="px-4 pb-4">{children}</CardContent>}
    </Card>
  );
}
