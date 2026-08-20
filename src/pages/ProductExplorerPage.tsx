'use client';

import React, { useState, useMemo } from 'react';
import { Search, Check, X, Cpu, Cable, Zap, Monitor, Shield, Server, Code2, Wrench, Eye, Cog, Wifi, Smartphone, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { PRODUCT_CATEGORIES } from '@/data';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  'Controllers': 'border-t-[#3b82f6]',
  'I/O Modules': 'border-t-[#8b5cf6]',
  'Motion Systems': 'border-t-[#f97316]',
  'HMI': 'border-t-[#06b6d4]',
  'HMI Panels': 'border-t-[#06b6d4]',
  'Safety': 'border-t-[#ef4444]',
  'Safety Technology': 'border-t-[#ef4444]',
  'Industrial PCs': 'border-t-[#10b981]',
  'Software': 'border-t-[#f59e0b]',
  'Accessories': 'border-t-[#6b7280]',
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Controllers': Cpu,
  'I/O Modules': Cable,
  'Motion Systems': Zap,
  'HMI Panels': Monitor,
  'Safety': Shield,
  'Industrial PCs': Server,
  'Software': Code2,
  'Accessories': Wrench,
  'PLC Systems': Cpu,
  'I/O Systems': Cable,
  'Vision Systems': Eye,
  'Safety Technology': Shield,
  'Motion Control': Zap,
  'Mechatronic Systems': Cog,
  'Robotics': Cog,
  'Network & Fieldbus': Cable,
  'Industrial IoT': Wifi,
  'Process Control': Settings2,
  'Mobile Automation': Smartphone,
  'HMI': Monitor,
};

export function ProductExplorerPage() {
  const { products, toggleProductUsed } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyToggled, setRecentlyToggled] = useState<Set<string>>(new Set());

  const usedCount = useMemo(
    () => products.filter((p) => p.usedInProject).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.engineeringRole.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const handleToggle = (name: string) => {
    toggleProductUsed(name);
    setRecentlyToggled((prev) => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
    setTimeout(() => {
      setRecentlyToggled((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }, 300);
  };

  const handleClearSelection = () => {
    products.forEach((p) => {
      if (p.usedInProject) toggleProductUsed(p.name);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">B&R Product Explorer</h1>
          <p className="text-sm text-muted-foreground">
            Explore the B&R product ecosystem for industrial automation.
          </p>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {usedCount} of {products.length} selected
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="h-9 pl-9 text-sm"
        />
      </div>

      {/* Selected count badge */}
      {usedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
            {usedCount} product(s) selected for project
          </span>
          <button
            onClick={handleClearSelection}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/5"
          >
            <X className="h-3 w-3" />
            Clear Selection
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Categories sidebar */}
        <div className="w-48 shrink-0">
          <div className="sticky top-0 space-y-0.5">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`w-full text-left rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All Categories
            </button>
            {PRODUCT_CATEGORIES.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              const IconComponent = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center gap-2 text-left rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {IconComponent && <IconComponent className="h-3.5 w-3.5 shrink-0" />}
                  <span className="flex-1 truncate">{cat}</span>
                  <span className="text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-3">
            {filteredProducts.length} product(s)
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.name}
                animate={recentlyToggled.has(product.name) ? { scale: [0.95, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`rounded-md border border-t-2 p-3 transition-colors duration-150 ${
                  product.usedInProject
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card hover:border-primary/20'
                } ${CATEGORY_BORDER_COLORS[product.category] || ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground">{product.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{product.category}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[8px] bg-primary/10 text-primary rounded px-1 shrink-0">B&R</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">{product.description}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1.5">
                      <span className="font-medium text-foreground">Engineering Role:</span> {product.engineeringRole}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(product.name)}
                    className={`shrink-0 flex items-center justify-center rounded-md transition-colors ${
                      product.usedInProject
                        ? 'h-7 px-2.5 border border-primary bg-primary text-primary-foreground text-[11px] font-medium gap-1'
                        : 'h-6 w-6 border border-border bg-card text-transparent hover:border-primary/50 hover:text-primary/50'
                    }`}
                    title={product.usedInProject ? 'Remove from project' : 'Add to project'}
                  >
                    {product.usedInProject ? (
                      <><Check className="h-3 w-3" /><span>Used</span></>
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-sm text-muted-foreground">No products found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
