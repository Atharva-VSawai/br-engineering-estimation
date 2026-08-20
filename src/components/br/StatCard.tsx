'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, sublabel, icon }: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground leading-tight">{value}</p>
            {sublabel && (
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{sublabel}</p>
            )}
          </div>
          {icon && (
            <div className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
