# 🚀 H-TeamState: Real-Time Hackathon Workspace

H-TeamState is a high-performance, real-time collaboration dashboard designed specifically for hackathon teams. Built with a **React** frontend and a **Node.js/Express** backend, it leverages **Supabase** for live data synchronization and a persistent workspace.

!

## ✨ Key Features

* **⚡ Real-Time Dashboard**: Instant synchronization of project tasks, team names, and messages across all connected devices.
* **⏱️ Global Tournament Clock**: A shared hackathon timer with Start, Pause, and Reset capabilities synced via Supabase.
* **📋 Agile Task Board**: Manage sprint completion with priority-coded tasks (High, Medium, Low).
* **🏗️ Architecture Flow**: A dedicated space for mapping out project logic using ReactFlow.
* **💬 Team Sync Chat**: Instant messaging to keep the team aligned without leaving the workspace.
* **🔒 Secure ID Access**: Projects are protected by unique Access IDs, ensuring only your team can enter the workspace.

## 🛠️ Tech Stack

**Frontend:** React.js, Lucide-React (Icons), ReactFlow, Supabase-JS.  
**Backend:** Node.js, Express, Socket.io (for future socket implementations).  
**Database/Auth:** Supabase (PostgreSQL + Realtime Engine).

## 📂 Project Structure

```text
H-TeamState/
├── client/           # React Frontend
│   ├── src/          # Components, Pages, and Supabase Client
│   └── .env          # Frontend environment variables (ignored by Git)
├── server/           # Node.js Backend
│   ├── server.js     # API and Socket logic
│   └── .env          # Server-side secrets (ignored by Git)
└── .gitignore        # Master ignore file for security
---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### 1. Prerequisites
* **Node.js**: Version 16 or higher is required.
* **Supabase Account**: You will need an active project to connect the database and realtime features.

### 2. Environment Setup
To protect your credentials, sensitive keys are stored in environment variables. Create a `.env` file in the **`client`** directory and add your Supabase details:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

---

Security
Security is a top priority for this workspace:

Credential Protection: This project uses .env files to keep Supabase credentials secure and local to your machine.

Git Safety: The root .gitignore is strictly configured to ensure that no sensitive keys or environment files are ever pushed to GitHub history.

Monorepo Protection: All sub-directories are covered by a global ignore pattern to prevent accidental data leaks.
