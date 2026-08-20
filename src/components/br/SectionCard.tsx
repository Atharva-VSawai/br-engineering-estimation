'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({ title, description, children, action, className = '', noPadding }: SectionCardProps) {
  return (
    <Card className={`rounded-lg border-border bg-card transition-all duration-200 hover:shadow-sm overflow-hidden ${className}`}>
      <CardHeader className="pt-4 px-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
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
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
      {noPadding ? children : <CardContent className="px-4 pb-4">{children}</CardContent>}
    </Card>
  );
}
