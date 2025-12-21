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
