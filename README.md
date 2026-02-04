# S.A.F.E — Seismic Assessment & Forecast Engine

S.A.F.E is a full-stack tool that helps teams understand how risky a building is during an earthquake. It collects building details, runs a lightweight AI model, layers on Indian seismic heuristics, and returns a clear safety score with retrofit suggestions. The project now includes Supabase authentication, persistent user profiles, and a GitHub Pages deployment flow.

## What the project delivers

- **Risk scoring** – Converts building details (year, floors, material, seismic zone, typology) into a 10–99 vulnerability score.
- **Actionable advice** – Lists weak areas in the structure and suggests retrofits with cost and risk reduction estimates.
- **3D visualization** – Highlights critical zones and evacuation paths in an interactive scene powered by React Three Fiber.
- **Saved profiles** – Uses Supabase to store personal details and building history per user.
- **Reports & planning** – Provides emergency, maintenance, and summary views suited for stakeholder updates.

![SAFE Screenshot](docs/structure_detail.txt)

## Repository layout

```
.
├─ App.tsx                     # Entry point, HashRouter setup for GitHub Pages
├─ components/                 # Dashboard widgets, auth pages, 3D viewer, reports
├─ state/AppStateContext.tsx   # Global state, Supabase session sync
├─ services/                   # API helpers (Supabase + backend analysis)
├─ backend/                    # FastAPI server + StructuralAnalyzer model
├─ supabase/                   # SQL schema + Supabase client bootstrap
├─ docs/                       # Plain-language summaries and model notes
└─ .github/workflows/          # GitHub Pages deployment pipeline
```

## Tech stack

- **Frontend:** React 19, Vite, TypeScript, React Three Fiber
- **Backend:** FastAPI, PyTorch, NumPy
- **Auth & storage:** Supabase (PostgreSQL + Auth)
- **Hosting:** GitHub Pages (static app) + GitHub Actions workflow

## Getting started

1. **Install packages**
   ```bash
   npm install
   pip install -r backend/requirements.txt
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env.local` (if present) and set:
     ```bash
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_public_anon_key
     ```
   - Add the same keys as GitHub repository secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) for deployments.

3. **Run the backend**
   ```bash
   python backend/server.py
   ```
   The API listens on `http://127.0.0.1:8000/analyze`.

4. **Run the frontend**
   ```bash
   npm run dev
   ```
   Open the Vite URL shown in the console (usually `http://127.0.0.1:5173/`).

5. **Use the app**
   - Create an account or log in (Supabase auth).
    - Fill in building details through the onboarding/profile forms.
   - Press **Run Analysis** on the dashboard to fetch scores and recommendations.
   - Explore the 3D viewer, emergency view, and reports.

## Supabase setup checklist

1. Run the SQL in `supabase/schema.sql` (via Supabase SQL editor or CLI).
2. Enable email/password auth and add redirect URLs for local dev and GitHub Pages.
3. Add your GitHub Pages domain to the Supabase URL allow list.
4. Confirm Row Level Security policies are enabled (they restrict access by user ID).

## Deployment (GitHub Pages)

- Workflow: `.github/workflows/deploy-pages.yml`
  1. Builds the Vite project with environment secrets.
  2. Uploads the static bundle as Pages artifact.
  3. Publishes to the `gh-pages` branch.
- Frontend routing uses `HashRouter` and `vite.config.ts` sets `base: '/Hackathon-Project-/'` so routes work on static hosting.
- Whenever secrets change, redeploy to refresh the environment.

## Troubleshooting

- **Auth errors:** Ensure Supabase URL/key are set in `.env.local` and GitHub Secrets. Check Supabase auth logs for blocked redirects.
- **Blank screen or 404 on GitHub Pages:** Verify Pages is enabled, workflow finished successfully, and the `base` path matches the repo name.
- **Score not loading:** Confirm the backend server is running and that CORS allows the frontend origin. Console logs point to the failing step.

## Documentation hub

- `docs/project_summary.txt` – Simple language overview of goals, problems solved, and features.
- `docs/project_overview.txt` – Detailed implementation breakdown and roadmap.
- `docs/model_explanation.txt` – Plain-language explanation of the Torch model and analyzer heuristics.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
