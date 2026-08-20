'use client';

import React, { useState, useCallback } from 'react';
import { Bell, Check, Download, Moon, Copy, CheckCircle, Plus, File, Gauge, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface NotificationItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  icon: React.ElementType;
  color: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', action: 'Configuration saved', detail: 'All changes persisted locally', time: '2 min ago', icon: Check, color: 'text-emerald-500', unread: true },
  { id: '2', action: 'Sample data loaded', detail: 'Default configuration applied', time: '15 min ago', icon: Download, color: 'text-blue-500', unread: true },
  { id: '3', action: 'Dark mode enabled', detail: 'Theme preference updated', time: '1 hour ago', icon: Moon, color: 'text-violet-500', unread: true },
  { id: '4', action: 'Project duplicated', detail: 'Copy created successfully', time: '2 hours ago', icon: Copy, color: 'text-amber-500', unread: false },
  { id: '5', action: 'Step 5 completed', detail: 'Motion configuration done', time: '3 hours ago', icon: CheckCircle, color: 'text-emerald-500', unread: false },
  { id: '6', action: 'New project created', detail: 'Project added to workspace', time: '1 day ago', icon: Plus, color: 'text-blue-500', unread: false },
  { id: '7', action: 'Estimate exported', detail: 'JSON file downloaded', time: '2 days ago', icon: File, color: 'text-purple-500', unread: false },
  { id: '8', action: 'Complexity assessed', detail: 'Score calculated: 62/100', time: '3 days ago', icon: Gauge, color: 'text-orange-500', unread: false },
];

export function useNotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  return { open, toggle, close, unreadCount, notifications, markAllRead };
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  unreadCount: number;
  notifications: NotificationItem[]
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
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
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
              {notifications.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/30 ${
                      item.unread ? 'bg-primary/5 border-l-2 border-l-primary/30' : ''
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50">
                      <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight">{item.action}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{item.detail}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
