# Scoreboard Forecasting Project
This project consists of two parts:
- **Frontend** (`scoreboard-frontend/`) — built with Next.js (Turbopack)
- **Backend** (`scoreboard-backend/`) — built with FastAPI (Python 3.12)

Both can be installed and run together easily from the **root directory** using npm scripts!

---

## Requirements
Make sure your device has:
- **Node.js** version **18 or higher** (required for Next.js)
- **Python** version **3.12**
- **pip** for Python package management

You can verify by running:
```bash
node -v
python --version
pip --version
```

---

## Setup Instructions
### 1. Install all dependencies
Run this command **first** to install frontend dependencies and backend Python packages at the same time:
```bash
npm run install-all
```
> This command runs `npm install` inside `scoreboard-frontend/` and `pip install -r scoreboard-backend/requirements.txt` **concurrently**.

---

### 2. Run the development servers
After installing, start both the frontend and backend development servers with:
```bash
npm run dev
```
> This command runs `npm run dev` inside `scoreboard-frontend/` (starting Next.js at http://localhost:3000) and `fastapi dev main.py` inside `scoreboard-backend/` (starting FastAPI at http://127.0.0.1:8000) **concurrently**.

---

## Notes
- All commands must be run from the **root project directory**.
- Both frontend and backend servers will run **simultaneously** using `npx concurrently`.
- No extra `node_modules` are created at the root directory.
- Ensure your Python environment has FastAPI installed (`pip show fastapi`).
- If you see a plotly import warning, install it with `pip install plotly` for interactive plots (optional).

---

## Folder Structure
```
/ (root)
  README.md
  package.json
  scoreboard-frontend/   (Next.js app)
  scoreboard-backend/    (FastAPI app)
    main.py
    requirements.txt
```

---