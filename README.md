# S.A.F.E — Seismic Assessment & Forecast Engine

This repository hosts S.A.F.E (Seismic Assessment & Forecast Engine): a 3D-enabled structural risk dashboard with AI-driven retrofit recommendations. The project consists of a Vite/React frontend and a FastAPI backend that simulates structural analysis without relying on Google Gemini services.

## Core Idea

S.A.F.E streamlines seismic retrofit planning for existing buildings. Users specify building parameters, run the backend analysis to generate vulnerability scores, and visualize the results in an immersive 3D scene. The system highlights high-risk areas, proposes retrofit strategies, and provides dashboards for maintenance planning, emergency response, and engineering reports.

## Project Structure

```
.
├─ App.tsx                      # Application entry, routing between views
├─ components/                  # UI modules (Dashboard, Reports, 3D viewer, etc.)
├─ backend/                     # FastAPI server and Torch-based inference stub
├─ services/analysisService.ts  # Frontend API client targeting the backend
└─ hackenv/                     # (Optional) Local Conda environment (gitignored)
```

## Requirements

- Node.js 20+
- Python 3.11+ (recommended)
- (Optional) Conda or virtualenv for Python dependencies

## Setup Instructions

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Configure backend environment

```bash
pip install -r backend/requirements.txt
```

> **Tip:** If you are using Conda, create and activate an environment first: `conda create -n structura python=3.11 && conda activate structura`

### 3. Run the backend server

```bash
python backend/server.py
```

The API will start on `http://127.0.0.1:8000`.

### 4. Run the frontend

```bash
npm run dev
```

Open the Vite URL (usually `http://127.0.0.1:5173/`) to access the dashboard. The frontend communicates with the backend’s `/analyze` endpoint for vulnerability scoring and retrofit suggestions.

## Startup Process (Quick Reference)

1. **Launch backend** – `python backend/server.py`
2. **Launch frontend** – `npm run dev`
3. **Open browser** – visit the Vite URL and configure building parameters.
4. **Run analysis** – trigger “Run Analysis” from the app; the frontend calls `/analyze` and updates dashboards and 3D overlays.

## Key Features

- Interactive 3D building visualization (React Three Fiber)
- Heatmaps, evacuation overlays, and sensor simulations
- FastAPI backend with Torch-based risk scoring logic
- Insight panels for retrofit options, reports, and vulnerability maps

## Troubleshooting

- **Blank screen on load:** Ensure both backend and frontend servers are running. Check browser console for network errors.
- **Dependency issues:** Update `pip` (`pip install --upgrade pip`) and reinstall requirements. For Node warnings, remove `node_modules` and reinstall.
- **Git pushes blocked by large files:** Delete `.env`, `hackenv/`, or other local artifacts from git history (they’re already ignored in `.gitignore`).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
