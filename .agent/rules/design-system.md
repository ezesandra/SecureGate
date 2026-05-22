---
trigger: always_on
---

# Design System Rules — SecureGate

## Source of Truth

All visual design tokens — typography, colors, spacing, line heights, border radius, shadows — are authored in `Tokens/colors.css` and `Tokens/typography.css` and consolidated into `src/styles/design-tokens.css`.

No agent or developer may hardcode any color, font size, spacing value, or shadow value anywhere in the codebase. Every value must reference a CSS custom property defined in `design-tokens.css`.

---

## Styling Method

- **CSS Modules only** — every component has its own `.module.css` file
- **No Tailwind CSS** — do not install it, do not use utility classes
- **No inline styles** — `style={{ }}` props are forbidden except for truly dynamic computed values (e.g. a progress bar width driven by JS state)
- **No styled-components or emotion** — CSS Modules + design tokens is the entire styling system

---

## How to Use Design Tokens

Import the tokens globally in `styles/globals.css`:

```css
@import './design-tokens.css';
```

Then reference them in any `.module.css` file:

```css
/* components/ui/Button/Button.module.css */

.button {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: var(--color-primary-hover);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Token Pipeline

1. Author tokens in `Tokens/colors.css` and `Tokens/typography.css` (source files)
2. Import both directly in `src/styles/globals.css`:
   ```css
   @import '../../Tokens/colors.css';
   @import '../../Tokens/typography.css';
   ```
3. Reference any token in `.module.css` files via `var(--token-name)`

---

## Dark Mode

A `[data-theme="dark"]` block is defined in `Tokens/colors.css`. Tokens automatically switch when `data-theme="dark"` is present on the `<html>` element.

To activate: read the user's system preference via `prefers-color-scheme: dark` (set `data-theme` in a `<script>` in the root layout) or provide a theme toggle that sets `document.documentElement.dataset.theme = 'dark'`.

Dark mode uses the same custom property names as light mode — only the values change. No component needs separate dark styles.

---

## Component Design Contracts

### All form pages (Signup, Login, Forgot Password, Reset Password)
- Centered single-column layout, max-width constrained for readability
- Each field has a visible `<label>` above the input
- Validation errors appear directly below the relevant input field
- Submit button shows a loading state (spinner or text change) while request is in flight
- Page-level error (e.g. wrong credentials) appears above the submit button, not as a browser alert

### Input Component
- Always has a `label` prop and an `id` for accessibility
- Accepts an `error` prop — when present, the input border changes to the error color token and the error message renders below
- Never uses placeholder text as a substitute for a label

### Button Component
- Accepts: `variant` (`primary` | `secondary` | `ghost`), `isLoading` (boolean), `disabled` (boolean)
- When `isLoading` is true: show a spinner, disable the button, do not allow double submission

### PasswordStrength Component
- Renders below the password input on the Signup page only
- Three states: `weak` | `fair` | `strong`
- Logic:
  - Weak: fewer than 8 characters
  - Fair: 8+ characters, meets 2 of 3 criteria (uppercase, number, special character)
  - Strong: 8+ characters, meets all 3 criteria
- Uses color tokens for each state — do not hardcode hex values

### FormError Component
- Used for field-level errors
- Renders as a `<span>` with `role="alert"` for accessibility
- Uses the error color token from `design-tokens.css`

### Spinner Component
- Renders an animated SVG spinner icon
- Accepts `size` prop (`sm` | `md` | `lg`) — maps to token-based dimensions
- Uses `--color-primary` for the spinner color
- Has `role="status"` with a visually hidden `<span>` reading "Loading..." for screen readers
- Used inside Button when `isLoading` is true, and on page-level loading/suspense boundaries

### Alert Component
- Used for page-level messages (success, error, warning, info)
- Accepts `variant` prop (`error` | `success` | `warning` | `info`)
- Renders with a colored left border and an icon matching the variant
- Uses token colors: `--color-error`, `--color-success`, `--color-warning` for borders
- Has `role="alert"` for accessibility
- Dismissible via an optional `onClose` callback

### PasswordInput Component
- Wraps the Input component with a show/hide password toggle button
- Accepts all Input props plus an optional `strengthIndicator` boolean
- When `strengthIndicator` is true, renders PasswordStrength below the input
- Toggle button changes `type="password"` / `type="text"` and must have `aria-label="Show password"` / `aria-label="Hide password"`

---

## Accessibility Requirements

Target: **WCAG 2.1 Level AA**.

- All form inputs must have associated `<label>` elements — no exceptions
- Inputs in an error state must have `aria-invalid="true"` and the error `<span>` linked via `aria-describedby`
- Error messages must use `role="alert"` so screen readers announce them
- Focus states must be visible — use `--color-border-focus` for the focus ring
- Color must never be the only means of conveying information (e.g. error states must also include an icon or text, not just a red border)
- Interactive elements must have a minimum tap target of 44×44px on mobile
- The root `<html>` element must have `lang="en"` in the root layout
- Respect `prefers-reduced-motion`: disable or reduce animations when the user's system setting requests it

---

## Responsive Design

- All pages must be usable on screens as narrow as 375px
- Layout is mobile-first: base styles are for mobile, use `min-width` media queries to scale up
- Do not use fixed pixel widths for form containers — use `max-width` with `width: 100%` and horizontal padding
- Breakpoints:
  - `640px` — mobile landscape
  - `768px` — tablet portrait
  - `1024px` — tablet landscape / small desktop
  - `1280px` — desktop

---

## What Is Forbidden

- Tailwind utility classes
- Hardcoded hex, rgb, or hsl color values in any `.module.css` file
- Hardcoded `px` font sizes — use the typography tokens from `design-tokens.css`
- Inline `style` props for anything that can be expressed as a CSS token
- Browser default form styles left unstyled — every input, button, and select must be explicitly styled
- `<style>` tags inside components — all styling must go in `.module.css` files
- `!important` in CSS — use selector specificity instead
- Global class overrides from outside a CSS Module — styles must be scoped to the component