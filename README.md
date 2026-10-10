# Pipeline CRM frontend

A React, TypeScript, and Vite CRM interface for the Sales Pipeline technical design. The implementation plan, separate-backend roadmap, and API contract are in [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

## Run locally

```sh
npm install
npm run dev
```

With no API URL configured, the app runs in demo mode using sample contacts and deals saved in browser local storage. Sign in with any non-empty email and password. Demo scoring, summaries, and assistant responses are illustrative and are not produced by an NLP model.

To connect a backend, copy `.env.example` to `.env.local`, set `VITE_API_URL` to the CRM API base URL, then restart Vite. The frontend uses the JWT REST contract in the implementation plan. In configured API mode, network or API errors are displayed and never silently replaced with sample data.

## Build and lint

```sh
npm run build
npm run lint
npm run format
```
