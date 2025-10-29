# Green Meter - Frontend Design Guidelines

## Design Principles
**Approach:** Data-focused design system prioritizing clarity, scannability, and professional credibility for corporate logistics platforms.

**Core Principles:**
1. Data clarity over decoration
2. Scannable hierarchy for rapid insights
3. Professional credibility for decision-makers
4. Consistent patterns for complex workflows

---

## Typography

### Font Families
- **Primary:** Inter (Google Fonts)
- **Monospace:** JetBrains Mono (numerical data only)

### Type Scale
```
Headers:
- H1: text-4xl font-bold (page titles)
- H2: text-3xl font-semibold (sections)
- H3: text-2xl font-semibold (cards)
- H4: text-xl font-medium (subsections)

Body:
- Large: text-lg (primary descriptions)
- Base: text-base (standard content)
- Small: text-sm (metadata, helpers)
- Tiny: text-xs (timestamps, footnotes)

Numerical:
- Metrics: text-3xl font-bold font-mono (KPIs)
- Tables: text-base font-mono (data values)
- Changes: text-sm font-semibold (percentages)

Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
```

---

## Layout System

### Spacing Scale
Use Tailwind units: **2, 4, 8, 12, 16, 20**

```
- Micro gaps: space-2, gap-2
- Component padding: p-4, py-4, px-6
- Cards: p-6 to p-8
- Sections: py-12 to py-20
- Page margins: px-4 (mobile), px-8 (tablet), px-12 (desktop)
```

### Containers & Grids
```
- Main content: max-w-7xl mx-auto
- Forms: max-w-2xl mx-auto
- Dashboard KPIs: grid-cols-1 md:grid-cols-3 gap-4
- Dual charts: grid-cols-1 lg:grid-cols-2 gap-8
- Calculator: grid-cols-1 md:grid-cols-2 gap-6

Vertical rhythm:
- Major sections: space-y-20
- Related elements: space-y-8
- Form fields: space-y-4
- Card internals: space-y-6
```

---

## Components

### Navigation

**Top Bar:**
```
- Height: h-16, sticky top-0, backdrop-blur
- Logo: h-8 w-auto
- Links: text-base font-medium gap-8
- Border: border-b
- Container: max-w-7xl
```

**Sidebar:**
```
- Width: w-64 (desktop), collapsible (mobile)
- Items: py-3 px-4 rounded-lg
- Active: font-weight + visual marker
- Icons: Heroicons
```

### Forms & Inputs

**Sliders:**
```html
<div class="mb-6">
  <label class="text-sm font-medium">Label</label>
  <div class="h-2 rounded-full"><!-- track --></div>
  <span class="text-lg font-semibold font-mono">Value</span>
  <p class="text-xs">Helper text</p>
</div>
```

**Text Inputs:**
```html
<div>
  <label class="text-sm font-medium mb-2">Label</label>
  <input class="p-3 rounded-lg border text-base font-mono text-right" />
  <p class="text-xs">Helper/error text</p>
</div>
```

### Data Display

**KPI Cards:**
```html
<div class="p-6 rounded-xl border shadow-sm">
  <p class="text-sm font-medium">Label</p>
  <p class="text-3xl font-bold font-mono">2,842</p>
  <p class="text-sm font-semibold">↓ 15%</p>
</div>
```

**Charts:**
```
- Container: p-8 rounded-xl border shadow-sm
- Title: text-xl font-semibold mb-6
- Pie charts: min-h-80, external labels, bottom legend
- Bar charts: min-h-96, grouped bars, y-axis font-mono
- Dual layout: grid-cols-1 lg:grid-cols-2 gap-8
- Tooltips: Category + value + percentage
```

**Leaderboard Table:**
```html
<table class="w-full">
  <thead class="bg-muted text-sm font-semibold uppercase tracking-wide sticky top-0">
  <tbody>
    <tr class="py-4 px-4 border-b hover:bg-muted transition">
      <td class="w-16 text-center">Rank + medal (top 3)</td>
      <td>Company name</td>
      <td class="font-mono font-semibold">Score</td>
      <td>Trend (↑↓→)</td>
    </tr>
    <!-- User row: border-l-4 accent highlight -->
  </tbody>
</table>
```

**Insight Cards:**
```html
<div class="p-6 rounded-xl border-l-4">
  <div class="size-6">Icon</div>
  <h3 class="text-lg font-semibold mb-2">Heading</h3>
  <p class="text-base leading-relaxed">Body</p>
  <button class="mt-4">Action</button>
</div>
```

**Benchmarking Table:**
```
Columns: Category | Your Share | Sector Leader | Suggestion
- Header: font-semibold text-sm
- Cells: py-3 px-4
- Values: font-mono
- Suggestions: text-sm action-oriented
```

### Buttons

```
Primary: px-6 py-3 text-base font-semibold rounded-lg w-full sm:w-auto
Secondary: Same sizing, border variant
Icon: h-10 w-10 rounded-lg (icon size-5)
Download: px-4 py-2 text-sm font-medium (icon + text)
```

### Modals

```
- Container: max-w-lg centered
- Header: p-6 border-b text-xl font-semibold
- Content: p-6
- Footer: p-6 border-t (actions)
- Close: top-right
```

---

## Page Layouts

**Home/Overview:**
```
- Hero: py-20 max-w-4xl centered, background image (h-96)
- Quick stats: grid-cols-1 md:grid-cols-3
- CTA: Prominent "Go to Calculator" button
```

**Calculator:**
```
- Desktop: 2-column (inputs left, results right sticky)
- Mobile: Stacked, fixed calculate button bottom
- Categories: Collapsible sections
- Reset: Secondary action
```

**Dashboard:**
```
- KPIs: grid-cols-1 md:grid-cols-3 lg:grid-cols-4
- Pie charts: grid-cols-1 lg:grid-cols-2 below KPIs
- Bar chart: Full-width below pies
- Download: Top-right
```

**Leaderboard:**
```
- Filters: Top row inline
- Table: Full-width sticky header
- User highlight: Visual emphasis
- Pagination: Bottom-center
```

**Benchmarking:**
```
- Comparison: Side-by-side metrics
- Recommendations: Full-width table
- Charts: Visual gap analysis
```

**Profile:**
```
- Form: max-w-2xl mx-auto
- Sections: Company Info | Logistics | Settings
- Avatar: Top-center (h-24 w-24)
- Save: Bottom-right
```

---

## Images

```
Hero: Full-width logistics imagery (trucks, planes, warehouses)
- Dimensions: h-96 to h-screen-80
- Overlay: backdrop-blur-md for text

Logos:
- Leaderboard: h-8 w-8 rounded
- Profile: h-24 w-24

Charts: Recharts library (no static images)
Empty states: Icon-based illustrations
```

---

## Accessibility

```
- Touch targets: Minimum 44×44px
- Focus: ring-2 offset-2 visible indicators
- Icons: aria-label attributes
- Tables: Proper th scope
- Forms: Immediate validation feedback
- Loading: Skeleton loaders (charts), spinners (calculations)
```

---

## Responsive Breakpoints

```
Mobile: Base (< 768px)
Tablet: md: (768px+) - 2-column layouts
Desktop: lg: (1024px+) - Full dashboards
Wide: xl: (1280px+) - Max-width constraints
```

---

## Animation

**Use sparingly:**
```
- Hover: transition-colors duration-200
- Modals: Fade + scale
- Charts: Smooth data transitions
- Loading: Pulse animation
- Avoid: Page transitions, excessive micro-interactions
```