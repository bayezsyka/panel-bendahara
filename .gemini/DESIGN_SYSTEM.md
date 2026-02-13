# BendaharaApp Design System

## Design Tokens

### Colors

| Token                    | Value                   | Usage                         |
| ------------------------ | ----------------------- | ----------------------------- |
| `--color-primary`        | `indigo-600` (#4f46e5)  | Buttons, links, active states |
| `--color-primary-hover`  | `indigo-700` (#4338ca)  | Hover states                  |
| `--color-primary-light`  | `indigo-50` (#eef2ff)   | Backgrounds, badges           |
| `--color-danger`         | `red-600` (#dc2626)     | Delete, error states          |
| `--color-success`        | `emerald-600` (#059669) | Success badges, income        |
| `--color-warning`        | `amber-600` (#d97706)   | Warnings                      |
| `--color-text-primary`   | `gray-900` (#111827)    | Headings, primary text        |
| `--color-text-secondary` | `gray-600` (#4b5563)    | Body text, descriptions       |
| `--color-text-muted`     | `gray-400` (#9ca3af)    | Hints, timestamps             |
| `--color-border`         | `gray-200` (#e5e7eb)    | Card/table borders            |
| `--color-surface`        | `white` (#ffffff)       | Cards, panels                 |
| `--color-background`     | `gray-50` (#f9fafb)     | Page background               |

### Typography

| Level         | Class                                                           | Usage              |
| ------------- | --------------------------------------------------------------- | ------------------ |
| Page Title    | `text-2xl font-bold text-gray-900`                              | Main page heading  |
| Section Title | `text-lg font-semibold text-gray-900`                           | Card/modal titles  |
| Body          | `text-sm text-gray-600`                                         | Default body text  |
| Caption       | `text-xs text-gray-500`                                         | Small labels, meta |
| Overline      | `text-[10px] font-bold text-gray-400 uppercase tracking-widest` | Section dividers   |

### Spacing

| Token          | Value                 | Usage                  |
| -------------- | --------------------- | ---------------------- |
| Page gap       | `space-y-6`           | Between page sections  |
| Card padding   | `p-6`                 | Inside cards           |
| Modal padding  | `p-6`                 | Inside modals          |
| Form field gap | `space-y-4` or `mb-4` | Between form fields    |
| Button gap     | `gap-3`               | Between action buttons |

### Border Radius

| Token  | Class          | Usage             |
| ------ | -------------- | ----------------- |
| Card   | `rounded-xl`   | All cards, panels |
| Button | `rounded-lg`   | All buttons       |
| Input  | `rounded-lg`   | All inputs        |
| Badge  | `rounded-full` | Status badges     |
| Modal  | `rounded-lg`   | Modal dialog      |

### Shadows

| Token | Class             | Usage                  |
| ----- | ----------------- | ---------------------- |
| Card  | `shadow-sm`       | Default card shadow    |
| Hover | `hover:shadow-md` | Interactive card hover |
| Modal | `shadow-xl`       | Modal overlay          |

## Component Library

All components live in `resources/js/Components/ui/` and are exported via barrel `ui/index.js`.

### 1. SearchInput

- **File:** `SearchInput.jsx`
- **Props:** `value`, `onChange(newValue)`, `placeholder`, `maxWidth`
- **Usage:** Replaces all inline search bars. Always pass `onChange` as a value setter, not event handler.

### 2. DataTable

- **File:** `DataTable.jsx`
- **Props:** `columns[]`, `data[]`, `emptyMessage`, `pagination`, `onRowClick`
- **Columns config:** `{ key, label, align?, render(row) }`
- **Usage:** Replaces all inline `<table>` elements. Includes built-in empty state and pagination.

### 3. Badge

- **File:** `Badge.jsx`
- **Props:** `variant`, `size`, `dot`, `children`, `className`
- **Variants:** `blue`, `green`, `emerald`, `red`, `yellow`, `purple`, `indigo`, `gray`
- **Sizes:** `sm`, `md`
- **Usage:** Replaces all inline status/category pills.

### 4. StatCard

- **File:** `StatCard.jsx`
- **Props:** `title`, `value`, `icon`, `iconBg`, `iconColor`, `trend?`
- **Trend:** `{ value: string, positive: boolean }`
- **Usage:** Replaces all inline KPI/metric cards in dashboards.

### 5. EmptyState

- **File:** `EmptyState.jsx`
- **Props:** `title`, `description`, `icon?`, `action?`
- **Usage:** Replaces all inline no-data/empty placeholders.

### 6. Select

- **File:** `Select.jsx`
- **Props:** `value`, `onChange(e)`, `options[]`, `placeholder`, `className`, and native select props
- **Options:** `{ value, label }`
- **Usage:** Replaces all inline `<select>` elements.

### 7. Card

- **File:** `Card.jsx`
- **Props:** `children`, `className`, `noPadding`, `hover`
- **Usage:** Wraps content in a consistent card container (`rounded-xl`, `border`, `shadow-sm`).

### Existing Base Components (Updated)

| Component         | Key Updates                                  |
| ----------------- | -------------------------------------------- |
| `PrimaryButton`   | `rounded-lg`, consistent sizing, disabled UX |
| `SecondaryButton` | Matches PrimaryButton sizing, border style   |
| `DangerButton`    | Matches Primary sizing, red-600 base         |
| `TextInput`       | `rounded-lg`, placeholder color, transitions |
| `PageHeader`      | Supports `subtitle`, `icon`, `badge` props   |
| `InputLabel`      | Cleaned of dark mode classes                 |
| `Modal`           | Cleaned of dark mode classes                 |
| `Checkbox`        | Cleaned of dark mode classes                 |

## Dark Mode Strategy

Dark mode is handled **globally** via CSS overrides in `resources/css/app.css`. Individual components do NOT contain dark mode classes. The Tailwind `darkMode: 'class'` setting has been removed.

## Refactored Pages

The following pages have been updated to use the design system:

### ProjectExpenses Module

- [x] `Projects/Index.jsx` — SearchInput, Badge, Card, EmptyState, Select
- [x] `Benderas/Index.jsx` — DataTable, form modal
- [x] `ExpenseTypes/Index.jsx` — DataTable, Badge, Select
- [x] `Mandors/Index.jsx` — SearchInput, Badge, Card, EmptyState
- [x] `ExpenseRequests/Index.jsx` — Badge, EmptyState, Select, Card

### Cash Module

- [x] `KasBesar.jsx` — DataTable, Badge, Select, Card, PageHeader
- [x] `KasKecil.jsx` — DataTable, Badge, Select, Card, PageHeader

### Receivable Module

- [x] `Index.jsx` — StatCard, SearchInput, Badge, Card, EmptyState

### Superadmin Module

- [x] `Users/Index.jsx` — DataTable, Badge, SearchInput, PageHeader
- [x] `ActivityLogs/Index.jsx` — DataTable, Badge, SearchInput, PageHeader

### Other

- [x] `Playground.jsx` — Component playground (route: `/playground`, superadmin only)

## Rules

1. **No inline `className` for search bars** — use `<SearchInput>`
2. **No inline `className` for tables** — use `<DataTable>`
3. **No inline `className` for status pills** — use `<Badge>`
4. **No inline `className` for stat metrics** — use `<StatCard>`
5. **No inline `className` for empty states** — use `<EmptyState>`
6. **No inline `<select>` styling** — use `<Select>`
7. **No inline card wrappers** — use `<Card>`
8. Modal forms must use consistent `p-6` padding and `space-y-4` field gaps
9. All action buttons in page headers go through `<PageHeader actions={...}>`
10. Page-level layout: `<BendaharaLayout>` → `<div className="space-y-6">` → content
11. Buttons: Use `<PrimaryButton>`, `<SecondaryButton>`, `<DangerButton>` — never raw `<button>` with inline styling for actions
