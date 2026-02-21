# AsyncShield Dashboard

A modern web interface for the AsyncShield federated learning system. This dashboard provides both server monitoring and client submission capabilities.

## Features

### Server Dashboard (`/`)
- **Live Global Model Version** - Real-time tracking of the current model version
- **Bounty Leaderboard** - Top contributors ranked by total bounties earned
- **Commit History** - Feed of recent model updates with acceptance/rejection status
- **Server Status** - Live connection indicator to FastAPI backend

### Client Interface (`/client`)
- **Submit Model Updates** - Upload `.pth` files to contribute to the global model
- **Download Current Model** - Fetch the latest global model weights
- **Download Architecture** - Get the `models.py` file defining the model structure
- **Real-time Version Sync** - Automatic synchronization with global model version
- **Bounty Tracking** - See earned bounties and acceptance status

## Prerequisites

Make sure the AsyncShield FastAPI backend is running:

```bash
# From the project root
python -m asyncshield.server
```

The backend should be accessible at `http://localhost:8000` with the following endpoints:
- `GET /get_model` - Fetch current global model
- `POST /submit_update_file` - Submit .pth file updates
- `GET /dashboard_data` - Retrieve dashboard statistics
- `GET /download_architecture` - Download models.py

## Installation

```bash
cd dashboard
npm install
# or
yarn install
# or
pnpm install
```

## Running the Frontend

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Configuration

The frontend connects to the backend at `http://localhost:8000` by default. To change this:

1. Update the API base URL in both page files:
   - `app/page.tsx` - Dashboard polling endpoint
   - `app/client/page.tsx` - Client submission endpoints

## How to Use

### For Contributors (Clients)

1. Navigate to `/client` or click "View Client" from the dashboard
2. Generate or enter a unique client ID
3. Download the current model and architecture to understand the structure
4. Train your model locally
5. Upload your trained `.pth` file
6. The system will automatically:
   - Validate your update using zero-trust evaluation
   - Calculate quality improvement
   - Award bounties if accepted
   - Update the global model version

### For Monitoring

1. The main dashboard at `/` shows:
   - Current global model version
   - Live commit feed with all submissions
   - Leaderboard of top contributors by bounty

## Design

The interface uses a **dark theme with teal accents** (`hsl(173 80% 40%)`), avoiding generic purple gradients. The design emphasizes:
- Clean, modern aesthetics with proper whitespace
- Clear visual hierarchy with consistent typography
- Real-time status indicators
- GitHub-style commit history feed

## Tech Stack

- **Next.js 16** (App Router)
- **React 19.2**
- **TypeScript**
- **Tailwind CSS 4**
- **Geist Font Family**
