# Navigation Performance Testing Guide

## Quick Test Checklist

Use this guide to verify the navigation performance optimizations are working correctly.

## Prerequisites

1. Install React DevTools browser extension
2. Enable React DevTools Profiler
3. Open the application in development mode

## Test Scenarios

### Test 1: Sidebar Toggle Performance

**Goal**: Verify that toggling the sidebar doesn't re-render navigation items

**Steps**:
1. Open React DevTools → Profiler tab
2. Click "Record"
3. Toggle sidebar open/close 5 times
4. Stop recording
5. Analyze the flame graph

**Expected Result**:
- Only 2-3 components should re-render per toggle
- `NavItemComponent` should NOT appear in the flame graph
- `NavigationList` should NOT re-render
- Only sidebar state-related components re-render

**Performance Indicators**:
```
✅ PASS: < 5 components re-render
⚠️  WARN: 5-10 components re-render
❌ FAIL: > 10 components re-render
```

### Test 2: Route Navigation Performance

**Goal**: Verify that route changes only re-render necessary components

**Steps**:
1. Open React DevTools → Profiler tab
2. Click "Record"
3. Navigate: Dashboard → Learning → Content → Assessment
4. Stop recording
5. Check which components re-rendered

**Expected Result**:
- `NavigationList` re-renders (expected - pathname changed)
- Active `NavItemComponent` re-renders (expected)
- `Breadcrumb` re-renders (expected)
- Other components should NOT re-render

**Performance Indicators**:
```
✅ PASS: 8-12 components re-render per navigation
⚠️  WARN: 12-20 components re-render
❌ FAIL: > 20 components re-render
```

### Test 3: Admin Navigation Isolation

**Goal**: Verify admin navigation doesn't affect main navigation

**Steps**:
1. Ensure userRole is set to 'admin'
2. Open React DevTools → Profiler tab
3. Click "Record"
4. Navigate to admin routes
5. Stop recording

**Expected Result**:
- Main `NavigationList` should NOT re-render when navigating admin routes
- Only `AdminNavigation` component should re-render
- Isolation between main and admin navigation confirmed

### Test 4: Mobile Responsiveness

**Goal**: Verify mobile sidebar performance

**Steps**:
1. Resize browser to mobile width (< 1024px)
2. Open React DevTools → Profiler tab
3. Click "Record"
4. Open sidebar → Click backdrop → Close sidebar (repeat 3 times)
5. Stop recording

**Expected Result**:
- Backdrop click doesn't cause navigation re-renders
- Animation is smooth (60fps)
- No layout shifts or jank

### Test 5: Memory Leak Check

**Goal**: Verify no memory leaks from re-renders

**Steps**:
1. Open Chrome DevTools → Memory tab
2. Take heap snapshot (Baseline)
3. Toggle sidebar 20 times
4. Navigate through all routes 3 times
5. Force garbage collection (trash icon)
6. Take another heap snapshot
7. Compare snapshots

**Expected Result**:
- Detached DOM nodes: < 10
- Memory increase: < 2MB
- No steadily increasing memory pattern

## Performance Benchmarks

### Sidebar Toggle Benchmark
```javascript
// Add to layout.tsx temporarily for testing
const startTime = performance.now()
setSidebarOpen(!sidebarOpen)
requestAnimationFrame(() => {
  const endTime = performance.now()
  console.log(`Sidebar toggle time: ${endTime - startTime}ms`)
})
```

**Target**: < 16ms (60fps)

### Route Navigation Benchmark
```javascript
// Monitor with Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Navigation timing:', entry.duration)
  }
})
observer.observe({ entryTypes: ['navigation', 'measure'] })
```

**Target**: Route change complete < 100ms

## Visual Testing with React DevTools

### Enable Highlight Updates
1. React DevTools → Settings (gear icon)
2. General → Check "Highlight updates when components render"
3. Perform actions and observe highlights

**Color Indicators**:
- **Green**: Infrequent updates (optimal)
- **Yellow/Orange**: Moderate updates
- **Red**: Frequent updates (investigate)

### Expected Highlights:
- **Sidebar Toggle**: Only sidebar container (green)
- **Route Navigation**: Active nav item + breadcrumb (green/yellow)
- **Admin Navigation**: Only admin section (green)

## Automated Performance Tests

Create a test file: `src/app/dashboard/__tests__/layout.performance.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { performance } from 'perf_hooks'

describe('Dashboard Layout Performance', () => {
  it('should toggle sidebar in < 16ms', () => {
    const { getByLabelText } = render(<DashboardLayout>...</DashboardLayout>)
    const toggleButton = getByLabelText('Toggle sidebar')

    const start = performance.now()
    fireEvent.click(toggleButton)
    const end = performance.now()

    expect(end - start).toBeLessThan(16)
  })

  it('should not re-render nav items on sidebar toggle', () => {
    const renderSpy = jest.fn()
    // Spy on NavItemComponent renders
    expect(renderSpy).toHaveBeenCalledTimes(6) // Initial render only
  })
})
```

## Profiling with Chrome DevTools

### CPU Profiling
1. Open Chrome DevTools → Performance tab
2. Click "Record"
3. Perform test actions
4. Stop recording
5. Analyze main thread activity

**Look For**:
- Yellow blocks (JavaScript): Should be minimal during sidebar toggle
- Purple blocks (Rendering): Should be isolated to changed components
- Green blocks (Painting): Should be localized

### Network Throttling Test
1. Chrome DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Verify prefetch={false} prevents eager fetching
4. Navigate routes and check Network tab

**Expected Result**:
- No prefetch requests on hover
- Only current route fetched
- Reduced bandwidth usage

## Common Issues and Solutions

### Issue: Navigation items still re-rendering on sidebar toggle

**Diagnosis**:
```typescript
// Add console.log to NavItemComponent
const NavItemComponent = memo(({ item, isActive }) => {
  console.log('NavItem render:', item.href, isActive)
  // ...
})
```

**Solutions**:
1. Verify React.memo is correctly applied
2. Check if props are changing unexpectedly
3. Ensure activeClassName/inactiveClassName are stable references

### Issue: High re-render count on route change

**Diagnosis**:
- Check React DevTools Profiler for render cascade
- Look for context providers causing re-renders

**Solutions**:
1. Verify pathname is the only changing dependency
2. Check if useMemo dependencies are correct
3. Ensure no inline object/array creation in props

### Issue: Breadcrumb not updating

**Diagnosis**:
```typescript
// Check if useMemo is caching incorrectly
useEffect(() => {
  console.log('Pathname changed:', pathname)
}, [pathname])
```

**Solutions**:
1. Verify pathname is in useMemo dependency array
2. Check if navItems array is stable
3. Ensure find logic is correct

## Performance Metrics Dashboard

Create a simple metrics display:

```typescript
// Add to layout for development
const [metrics, setMetrics] = useState({
  renderCount: 0,
  lastRenderTime: 0,
  avgRenderTime: 0
})

useEffect(() => {
  const start = performance.now()
  return () => {
    const end = performance.now()
    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: end - start,
      avgRenderTime: (prev.avgRenderTime * prev.renderCount + (end - start)) / (prev.renderCount + 1)
    }))
  }
})

// Display in dev mode
{process.env.NODE_ENV === 'development' && (
  <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
    <div>Renders: {metrics.renderCount}</div>
    <div>Last: {metrics.lastRenderTime.toFixed(2)}ms</div>
    <div>Avg: {metrics.avgRenderTime.toFixed(2)}ms</div>
  </div>
)}
```

## Continuous Performance Monitoring

### Lighthouse CI
Add to CI/CD pipeline:
```yaml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

**Target Scores**:
- Performance: > 90
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

### Web Vitals Monitoring
```typescript
// Add to _app.tsx or layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  console.log(metric)
  // Send to analytics service
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

## Test Report Template

```
# Performance Test Report

Date: YYYY-MM-DD
Tester: [Name]
Environment: [Development/Production]

## Test Results

### Sidebar Toggle Performance
- Re-render count: X components
- Average time: Xms
- Status: ✅ PASS / ❌ FAIL

### Route Navigation Performance
- Re-render count: X components
- Average time: Xms
- Status: ✅ PASS / ❌ FAIL

### Admin Navigation Isolation
- Isolated: Yes/No
- Status: ✅ PASS / ❌ FAIL

### Mobile Responsiveness
- Animation FPS: X
- Status: ✅ PASS / ❌ FAIL

### Memory Leak Check
- Memory increase: XMB
- Detached nodes: X
- Status: ✅ PASS / ❌ FAIL

## Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce
   - Recommended fix

## Recommendations
- [Performance improvement suggestions]
```

## Resources

- [React DevTools Profiler Tutorial](https://react.dev/learn/react-developer-tools#profiler)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

Last Updated: 2025-11-13
Version: 1.0.0
