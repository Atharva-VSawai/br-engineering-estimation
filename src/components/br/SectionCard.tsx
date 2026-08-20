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
    <Card className={`border-border bg-card ${className}`}>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0 ml-3">{action}</div>}
        </div>
      </CardHeader>
      {noPadding ? children : <CardContent className="px-4 pb-4">{children}</CardContent>}
    </Card>
  );
}