'use client';

import React, { useState, useMemo } from 'react';
import { Search, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { PRODUCT_CATEGORIES } from '@/data';

export function ProductExplorerPage() {
  const { products, toggleProductUsed } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleClearSelection = () => {
    products.forEach((p) => {
      if (p.usedInProject) toggleProductUsed(p.name);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">B&R Product Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Explore the B&R product ecosystem for industrial automation.
        </p>
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
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between text-left rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{cat}</span>
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
              <div
                key={product.name}
                className={`rounded-md border p-3 transition-all duration-150 hover:scale-[1.01] ${
                  product.usedInProject
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-white hover:border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground">{product.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{product.category}</div>
                    <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{product.description}</div>
                    <div className="text-[11px] text-muted-foreground mt-1.5">
                      <span className="font-medium text-foreground">Engineering Role:</span> {product.engineeringRole}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleProductUsed(product.name)}
                    className={`shrink-0 flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                      product.usedInProject
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-white text-transparent hover:border-primary/50 hover:text-primary/50'
                    }`}
                    title={product.usedInProject ? 'Remove from project' : 'Add to project'}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
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
