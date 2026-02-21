# AsyncShield Frontend Setup Guide

This guide explains how to run the complete AsyncShield system with both backend and frontend.

## System Overview

AsyncShield consists of:
- **FastAPI Backend** (Python) - Handles model aggregation, validation, and storage
- **Next.js Frontend** (React/TypeScript) - Provides dashboard and client interfaces

## Quick Start

### 1. Start the Backend Server

From the project root:

```bash
# Install Python dependencies (if not already done)
pip install -r requirements.txt

# Start the FastAPI server
python -m asyncshield.server
```

The backend will run at `http://localhost:8000`

**Verify it's running:**
- Open `http://localhost:8000/docs` in your browser
- You should see the FastAPI Swagger documentation

### 2. Start the Frontend Dashboard

In a new terminal, navigate to the dashboard folder:

```bash
cd dashboard

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The frontend will run at `http://localhost:3000`

### 3. Access the Application

- **Dashboard**: [http://localhost:3000](http://localhost:3000)
  - View global model version
  - See commit history
  - Check leaderboard

- **Client Interface**: [http://localhost:3000/client](http://localhost:3000/client)
  - Submit model updates
  - Download current model
  - Download architecture

## API Integration

The frontend connects to the backend at `http://localhost:8000` and uses these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/get_model` | GET | Fetch current global model |
| `/submit_update_file` | POST | Submit .pth model updates |
| `/dashboard_data` | GET | Get stats for dashboard |
| `/download_architecture` | GET | Download models.py |

## How to Submit Updates

1. Navigate to `/client` page
2. Generate or enter a client ID
3. Download the current model and architecture
4. Train your model locally (see client examples in `/client` folder)
5. Upload your trained `.pth` file
6. The system validates and potentially accepts your update

## Troubleshooting

### Backend not connecting
- Ensure FastAPI is running: `python -m asyncshield.server`
- Check the terminal for error messages
- Verify port 8000 is not in use

### Frontend build errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Ensure Node.js version 18+ is installed

### CORS errors
- The backend is configured to accept requests from `http://localhost:3000`
- If you change the frontend port, update `allow_origins` in `server/main.py`

## Production Deployment

### Backend
Deploy the FastAPI server to a platform that supports Python (e.g., Railway, Fly.io, AWS)

### Frontend
1. Update API URLs in `app/page.tsx` and `app/client/page.tsx` to point to your production backend
2. Deploy to Vercel (recommended) or any static hosting:
   ```bash
   npm run build
   ```

## Architecture

```
┌─────────────────────┐
│   Next.js Frontend  │
│  (localhost:3000)   │
│                     │
│  • Dashboard (/)    │
│  • Client (/client) │
└──────────┬──────────┘
           │
           │ HTTP REST API
           │
┌──────────▼──────────┐
│  FastAPI Backend    │
│  (localhost:8000)   │
│                     │
│  • Model Storage    │
│  • Validation       │
│  • Aggregation      │
│  • Database         │
└─────────────────────┘
```

## File Structure

```
asyncshield/
├── server/              # FastAPI backend
│   ├── main.py         # API endpoints
│   ├── aggregator.py   # Model aggregation
│   ├── evaluator.py    # Quality validation
│   └── database.py     # SQLite storage
├── client/             # Example training clients
└── dashboard/          # Next.js frontend
    ├── app/
    │   ├── page.tsx           # Dashboard view
    │   ├── client/page.tsx    # Client submission
    │   └── layout.tsx         # Root layout
    └── components/
        ├── CommitCard.tsx     # Commit history
        └── LeaderboardTable.tsx # Bounty rankings
```

## Next Steps

- Review the main README for system architecture details
- Explore `/client` folder for training examples
- Check backend logs to understand validation logic
- Experiment with submitting updates from the client interface
