# App Pass SDK — Example Extension

A complete Chrome extension demonstrating how to integrate with the [`@chrome-stats/app-pass-sdk`](https://www.npmjs.com/package/@chrome-stats/app-pass-sdk). This example is built with **Vite**, **Svelte**, and **CRXJS**.

## What This Example Shows

- **Popup UI** — Checks App Pass status on open, displays active/inactive/error states with a polished Svelte UI.
- **Activate Flow** — Opens the App Pass activation page via `activateAppPass()`
- **Manage Subscription** — Opens the management page via `manageAppPass()`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Development mode (HMR)

```bash
npm run dev
```

This will run Vite in development mode. You can load the `example/dist` folder into Chrome as an unpacked extension, and changes to Svelte components will automatically update via HMR (Hot Module Replacement).

### 3. Build for production

```bash
npm run build
```

This creates an optimized, bundled `dist/` directory ready for production.

### 4. Load in Chrome

1. Navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder inside this `example/` directory

## Project Structure

```
example/
├── manifest.json          # Chrome MV3 manifest
├── package.json           # Dependencies & build scripts
├── vite.config.ts         # Vite CRXJS + Svelte configuration
├── svelte.config.js       # Svelte preprocess config
├── tsconfig.json          # TypeScript config
├── popup.html             # Popup entry HTML
└── src/
    ├── App.svelte         # Main popup Svelte UI
    └── popup.ts           # Mounts the Svelte component
```

## Key Integration Points

See `src/App.svelte` for the main popup logic integrating `checkAppPass()`, `activateAppPass()`, and `manageAppPass()`.
