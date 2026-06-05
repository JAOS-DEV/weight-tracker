# WeightPal

A simple weight tracking app built with React and TypeScript.

## Features

- Log one weight entry per day (kg or lb)
- Weekly and monthly averages
- Progress stats with time range filters and a line chart
- Full history with edit and delete
- App-wide preferred unit setting with automatic conversion

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run test` — run utility tests
- `npm run preview` — preview production build

## Data storage

Entries and settings are stored in `localStorage`. The storage layer in `src/storage/weightStorage.ts` is designed so it can be swapped for Firebase or another backend later.

## GitHub Pages

This app is configured for project pages at:

**https://jaos-dev.github.io/weight-tracker/**

### One-time GitHub setup

1. Go to your repo **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not "Deploy from a branch")
3. Push to `master` — the workflow in `.github/workflows/deploy.yml` builds `dist` and deploys it

### Why the `/src/main.tsx` 404 happens

That error means GitHub Pages is serving the raw source `index.html` instead of the production build. The built app loads bundled JS from `/weight-tracker/assets/`, not `/src/main.tsx`. The GitHub Actions workflow fixes this by deploying only the `dist` folder.
