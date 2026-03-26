# Tailwind Dynamic Class Fixes

## The Problem

Tailwind CSS v4 (and v3's JIT mode) scan source files for class names at build time.
When you construct class names dynamically using template literals, Tailwind cannot
detect them and the corresponding CSS is never generated.

## Affected Files

### 1. `src/pages/Dashboard.tsx` — Resonance Matches panel (~line 90-110)

**Broken pattern:**
```tsx
<div className={`px-2 py-0.5 bg-${match.glow}/10 border border-${match.glow}/20 text-${match.glow} ...`}>
```

Tailwind cannot detect `bg-accent-green/10`, `text-accent-blue`, etc. when built from variables.

**Fix — use a lookup object with full static class strings:**
```tsx
const MATCH_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  'accent-green': { bg: 'bg-accent-green/10', border: 'border-accent-green/20', text: 'text-accent-green' },
  'accent-blue':  { bg: 'bg-accent-blue/10',  border: 'border-accent-blue/20',  text: 'text-accent-blue' },
  'slate-500':    { bg: 'bg-slate-500/10',     border: 'border-slate-500/20',    text: 'text-slate-500' },
  'accent-purple':{ bg: 'bg-accent-purple/10', border: 'border-accent-purple/20',text: 'text-accent-purple' },
};

// Then in the JSX:
const s = MATCH_STYLES[match.glow] || MATCH_STYLES['slate-500'];
<div className={`px-2 py-0.5 ${s.bg} ${s.border} ${s.text} rounded text-[10px] font-mono font-bold ...`}>
```

### 2. `src/pages/OrgDashboard.tsx` — Talent Resonance panel (~line 130-160)

Same pattern. The candidate match cards use dynamic classes:
```tsx
<div className={`absolute top-0 right-0 bottom-0 w-1 bg-${match.outline} ...`}></div>
<div className={`w-8 h-8 rounded-full bg-${match.bg} border border-${match.outline}/30 ...`}>
```

**Fix — same lookup object approach.** Define a `CANDIDATE_STYLES` map at the top of the file.

### 3. `src/pages/CollegeDashboard.tsx` — No dynamic class issues found.

## Quick Verification

After applying fixes, check in browser DevTools:
1. Inspect a match score badge → should have the colored background
2. Inspect candidate cards → right-side color bar should be visible
3. If colors are missing, the class was not picked up by Tailwind
