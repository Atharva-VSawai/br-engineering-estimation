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
    <Card className={`group rounded-lg border border-border border-l-2 border-l-primary/30 bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-px hover:border-primary/25 overflow-hidden ${className}`}>
      <CardHeader className="pt-5 px-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0 ring-2 ring-primary/10" />
            <div>
              <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
              )}
            </div>
          </div>
          {action && (
            <div className="shrink-0 ml-3 rounded-md bg-muted/50 p-1.5 hover:bg-muted transition-colors duration-150">
              {action}
            </div>
          )}
        </div>
      </CardHeader>
      <div
        className="h-[2px] bg-gradient-to-r from-primary/50 via-primary/15 to-transparent group-hover:w-full transition-all duration-500 ease-out w-2/5"
        style={accentColor ? { background: `linear-gradient(to right, ${accentColor}66, ${accentColor}1a, transparent)` } : undefined}
      />
      {noPadding ? children : <CardContent className="px-5 pb-5">{children}</CardContent>}
    </Card>
  );
}
