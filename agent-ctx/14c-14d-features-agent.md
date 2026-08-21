# Task 14c-14d: Effort Allocation Bars + Complexity Radar Chart

## Work Done

### 14c: Engineering Activities Page — Effort Allocation Bars
**File**: `src/pages/EngineeringActivitiesPage.tsx`
- Added `useMemo` import
- Defined `effortData` array (7 categories with name, hours, color) wrapped in `useMemo`
- Inserted new `motion.div` + `SectionCard` titled "Effort Allocation Overview" with description "Estimated effort distribution across engineering disciplines"
- Renders full-width horizontal stacked bar (h-8, rounded-md, overflow-hidden, flex) with proportional segment widths
- Legend grid (grid-cols-2 sm:grid-cols-4, gap-2) with colored squares, names, hours and percentages
- Total line: "Total Estimated Effort: X hours" styled as text-sm font-semibold text-foreground
- Positioned after the Activity Matrix SectionCard and before the Engineering Lifecycle SectionCard

### 14d: Compare Page — Radar Chart for Complexity
**File**: `src/pages/ComparePage.tsx`
- Defined 10 radar dimensions (hardware, motion, hmi, vision, safety, communication, software, integration, requirement, testing)
- Complexity level mapping: { Low: 1, Medium: 2, High: 3, 'Very High': 4 }
- 3 project colors: orange, cyan, purple (fill + stroke)
- Helper functions: `vertex()`, `polygonPoints()` for coordinate calculation
- `ComplexityRadar` component with SVG (300x300 viewBox, center 150,150, max radius 110)
- 4 concentric polygon rings at 25%, 50%, 75%, 100% of max radius (stroke-muted/40, no fill)
- 10 axis lines from center to vertices
- Filled polygons per selected project with project-specific colors
- Dimension labels at each vertex (fontSize 9, text-muted-foreground)
- Legend below radar with colored circles + project names
- All polygon/label data computed in `useMemo`
- Conditionally rendered when `selectedProjects.length >= 2`, placed after comparison table inside AnimatePresence

## Verification
- ESLint: Clean (0 errors)
- Dev server: Compiles successfully (305ms)
