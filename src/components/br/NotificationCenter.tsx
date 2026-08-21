'use client';

import React from 'react';
import { Bell, Check, Download, Moon, Copy, CheckCircle, Plus, File, FileText, Gauge, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/store';

/** Map string icon names to Lucide components */
const ICON_MAP: Record<string, React.ElementType> = {
  Check,
  Download,
  Moon,
  Copy,
  CheckCircle,
  Plus,
  File,
  FileText,
  Gauge,
  Save,
};

const DEFAULT_ICON = Check;

/** Format a timestamp into a human-readable relative time string */
function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  unreadCount: number;
  notifications: Notification[];
  onMarkAllRead: () => void;
}

export function NotificationCenter({ open, onClose, unreadCount, notifications, onMarkAllRead }: NotificationCenterProps) {
  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Slide-out panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 z-50 h-full w-80 border-l border-border bg-card shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground mt-2">All caught up!</p>
                </div>
              )}
              {notifications.map((item, index) => {
                const Icon = item.icon ? (ICON_MAP[item.icon] ?? DEFAULT_ICON) : DEFAULT_ICON;
                const colorClass = item.color || 'text-emerald-500';
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/30 ${
                      !item.read ? 'bg-primary/5 border-l-2 border-l-primary/30' : ''
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50">
                      <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">{item.message}</p>
                      {item.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.detail}</p>
                      )}
                    </div>
                    <span className={`text-xs shrink-0 mt-0.5 ${!item.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{formatTime(item.timestamp)}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
