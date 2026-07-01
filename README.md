# Notion Wallet Dashboard

A modern, local, and secure financial analytics dashboard that synchronizes and caches your personal financial data from Notion into a local PostgreSQL database. Built using a decoupled, enterprise-grade modular architecture.

## 🚀 Architecture Overview

Instead of querying the slow and rate-limited Notion API on every page load, this application uses a **Relational Caching Pattern**. It syncs raw data to a local PostgreSQL instance, enabling rapid analytics and real-time balance calculations with sub-millisecond response times.

```
[ Notion API ]
      │ (Manual or Scheduled Sync)
      ▼
[ Backend: NestJS REST API ] ──► [ Database: PostgreSQL (ORM: Prisma v6) ]
      │                                       │
      │ (Sub-millisecond queries)             │
      ▼                                       ▼
[ Frontend: Next.js App Router ] ◄────────────┘
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (React, Tailwind CSS, Shadcn/ui, Recharts)
- **Backend:** NestJS (TypeScript, Modular Architecture, Dependency Injection)
- **Database:** PostgreSQL (Self-hosted inside Docker)
- **ORM:** Prisma v6 (Fully type-safe data access)
- **Deployment:** Docker & Docker Compose (Optimized for Proxmox LXC)

## ✨ Key Engineering Features

1. **Defensive API Querying:** Custom dynamic title resolution scans for the Notion `title` block regardless of its property name, making the integration highly resilient to Notion database column renaming.
2. **Notion Pagination Bypass:** Built-in recursive fetching using cursors to bypass the default 100-page limit of the Notion API, ensuring full historical data synchronization.
3. **Dynamic Balance Calculation:** Account balances are computed dynamically in PostgreSQL using optimized `groupBy` and `_sum` database queries, ensuring real-time data integrity when transactions are modified locally.
4. **Relational Integrity Checks:** Integrated validation checks skip incomplete Notion draft records (missing dates or relation references), ensuring strict referential integrity within PostgreSQL.
5. **Unified Orchestrator & Logging:** A single `/sync/all` endpoint syncs all 8 databases sequentially in the correct relational order and logs the execution metadata (status, count, duration) into a database `SyncLog` table.

## 📦 How to Run Locally (Single-Command Run)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/notion-budget-dashboard.git
   cd notion-budget-dashboard
   ```
2. Copy the `.env.example` to `.env` in the root folder and fill in your actual Notion API Token and Database IDs:
   ```bash
   cp .env.example .env
   ```
3. Run the entire stack using Docker Compose:
   ```bash
   docker compose up --build -d
   ```
4. Access the applications:
   - **Frontend Dashboard:** [http://localhost:3001](http://localhost:3001)
   - **Backend REST API:** [http://localhost:3000](http://localhost:3000)
```
