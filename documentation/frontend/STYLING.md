# 🎨 Styling Guide

This document covers the styling conventions and TailwindCSS patterns used in the application.

## TailwindCSS Configuration

The project uses TailwindCSS with custom configuration in `tailwind.config.js`.

### Dark Mode

Dark mode is enabled via the `class` strategy:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

Toggle by adding/removing `dark` class on `<html>` element.

## Color Palette

### Primary Colors

| Mode | Color | Tailwind Class | Usage |
|------|-------|----------------|-------|
| Light | red | `green-500`, `green-600` | Primary actions, accents |
| Dark | Blue | `blue-500`, `blue-600` | Primary actions, accents |

### Background Colors

| Mode | Color | Tailwind Class | Usage |
|------|-------|----------------|-------|
| Light | White | `white` | Cards, containers |
| Light | Gray | `gray-50` | Page background |
| Dark | Dark Gray | `gray-800` | Cards, containers |
| Dark | Darker Gray | `gray-900` | Page background |

### Text Colors

| Mode | Color | Tailwind Class | Usage |
|------|-------|----------------|-------|
| Light | Black | `gray-900` | Primary text |
| Light | Gray | `gray-500` | Secondary text |
| Dark | White | `white` | Primary text |
| Dark | Light Gray | `gray-400` | Secondary text |

### Border Colors

| Mode | Color | Tailwind Class |
|------|-------|----------------|
| Light | Light Gray | `border-gray-200` |
| Dark | Dark Gray | `border-gray-700` |

## Common Patterns

### Card Styling

```jsx
// Standard card
<div className="bg-white dark:bg-gray-800 
                rounded-2xl p-6 
                border border-gray-200 dark:border-gray-700 
                shadow-sm">

// Interactive card with hover
<div className="bg-white dark:bg-gray-800 
                rounded-2xl p-6 
                border border-gray-200 dark:border-gray-700 
                cursor-pointer 
                hover:border-green-500/50 dark:hover:border-blue-500/50 
                hover:shadow-xl 
                transition-all duration-300">
```

### Input Styling

```jsx
<input className="w-full px-4 py-3 rounded-xl 
                  bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700 
                  text-gray-900 dark:text-white 
                  placeholder-gray-400 
                  focus:outline-none 
                  focus:border-green-500 dark:focus:border-blue-500 
                  focus:ring-2 focus:ring-green-500/20 dark:focus:ring-blue-500/20 
                  transition-colors" />
```

### Button Styles

**Primary Button:**
```jsx
<button className="px-6 py-3 rounded-xl 
                   bg-gradient-to-r from-green-500 to-green-600 
                   dark:from-blue-500 dark:to-blue-600 
                   text-white font-semibold 
                   hover:from-green-600 hover:to-green-700 
                   dark:hover:from-blue-600 dark:hover:to-blue-700 
                   shadow-lg shadow-green-500/25 dark:shadow-blue-500/25 
                   transition-all duration-300">
```

**Secondary/Ghost Button:**
```jsx
<button className="px-4 py-2 rounded-lg 
                   border border-gray-200 dark:border-gray-700 
                   text-gray-700 dark:text-gray-300 
                   hover:bg-gray-50 dark:hover:bg-gray-800 
                   transition-colors">
```

### Badge/Tag Styling

```jsx
// Success badge
<span className="px-2 py-1 rounded-full text-xs 
                 bg-green-100 dark:bg-green-900/30 
                 text-green-600 dark:text-green-400">

// Warning badge
<span className="px-2 py-1 rounded-full text-xs 
                 bg-emerald-100 dark:bg-emerald-900/30 
                 text-emerald-600 dark:text-emerald-400">

// Error badge
<span className="px-2 py-1 rounded-full text-xs 
                 bg-green-100 dark:bg-green-900/30 
                 text-green-600 dark:text-green-400">
```

### Gradient Backgrounds

```jsx
// red gradient (light mode primary)
<div className="bg-gradient-to-r from-green-500 to-green-600">

// Blue gradient (dark mode primary)
<div className="bg-gradient-to-br from-blue-500 to-green-600">

// Subtle gradient for headers
<div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600">
```

## Responsive Design

Mobile-first approach with breakpoints:

| Prefix | Min Width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile |
| `sm:` | 640px | Large mobile |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |

Example:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## RTL (Right-to-Left) Support

The app primarily uses Arabic, which requires RTL layout:

```jsx
// Use text-right instead of text-left
<div className="text-right">

// Use directional classes
<div className="mr-4">  // margin-right
<div className="pr-4">  // padding-right

// Flex direction (already RTL-aware)
<div className="flex items-center gap-4">
```

## Animation & Transitions

### Transition Classes

```jsx
// Standard transition
<div className="transition-all duration-300">

// Color transition only
<div className="transition-colors duration-200">

// Transform transition
<div className="transition-transform duration-300 hover:scale-105">
```

### Loading Animation

```jsx
<div className="animate-spin rounded-full h-8 w-8 
                border-b-2 border-green-500">
</div>
```

### Pulse Animation

```jsx
<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded">
</div>
```

## Shadow Utilities

```jsx
// Subtle shadow
<div className="shadow-sm">

// Standard shadow
<div className="shadow-lg">

// Colored shadow
<div className="shadow-lg shadow-green-500/25">

// Dark mode shadow
<div className="shadow-lg dark:shadow-blue-500/10">
```

## Z-Index Layers

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | `z-0` | Default content |
| Elevated | `z-10` | Cards, dropdowns |
| Sticky | `z-20` | Sticky headers |
| Overlay | `z-40` | Modals backdrop |
| Modal | `z-50` | Modal content |
| Navbar | `z-50` | Fixed navigation |

## Global Styles

Global styles are defined in `src/index.css`:

```css
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: theme('colors.gray.100');
}

.dark ::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

::-webkit-scrollbar-thumb {
  background: theme('colors.gray.300');
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}
```

## Best Practices

1. **Consistency** - Use the same styling patterns throughout
2. **Dark mode first** - Always add `dark:` variants when adding colors
3. **Semantic classes** - Use meaningful class combinations
4. **Avoid arbitrary values** - Use Tailwind's scale whenever possible
5. **Group related classes** - Keep classes organized (layout, colors, effects)
