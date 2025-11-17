<div align="center">
  <img src="https://ocean-fin.s3.ap-southeast-1.amazonaws.com/logo-ocean-fin.png" alt="OceanFin Logo" width="120" height="120" />

  <h1>Ocean Fin</h1>
</div>

# About OceanFin

**Autonomous DeFi Navigator for Polkadot**

OceanFin is a non-custodial, automated platform that simplifies yield generation across Polkadot (Asset Hub + Hydration). No middlemen, no complexity—just smart, data-driven strategies under your full control.

---

## 🚀 Features

* **Non-custodial:** Users retain 100% control of assets
* **Autonomous Strategies:** Discover and execute high-yield opportunities automatically
* **One-Click Execution:** Eliminate manual protocol hopping and spreadsheet math
* **Transparent & Secure:** Full visibility into strategies and execution
* **Cross-chain Ready:** Built for Polkadot ecosystem

---

## 🎯 Core Objectives

* Make DeFi simple and accessible—no expert knowledge required
* Keep assets fully under user control
* Automate strategy discovery and execution
* Provide clear, real-time activity tracking
* Enable seamless cross-chain operations

---

## 🛠️ Current Work

| Status | Feature                              |
| ------ | ------------------------------------ |
| ✅      | EVM account binding & wallet connect |
| ✅      | Loop strategies: GDOT & VDOT         |
| ✅      | Strategy simulation & execution      |
| ✅      | Activity tracking & progress updates |

---

## Roadmap

* [x] Stable Dapp
* [ ] Withdraw Strategies
* [ ] Executing by Agent Wallet (x402 Protocol)
* [ ] Cross-chain XCM
* [ ] More Strategies
* [ ] Metrics and Monitors
* [ ] Apply Grants

---

## ⚡ Quick Start

### Prerequisites

* **Node.js** ≥ 20
* **npm** ≥ 10
* **Windows PowerShell / CMD** (recommended)

Check your versions:

```bash
node -v
npm -v
```

### Clone the Repository

```bash
git clone https://github.com/Tizun71/OceanFin.git
cd OceanFin
```

---

### Environment Setup

Create `.env` files for both frontend and backend before running the app.

#### Frontend (`ui/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (`backend/apps/.env.development`)

```env
PORT=3001
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
```

---

### Install Dependencies

#### Frontend (Next.js)

```bash
cd ui
npm install
```

#### Backend (NestJS)

```bash
cd backend/apps
npm install
```

---

### Start Development Servers

#### Frontend (Next.js)

```bash
cd ui
npm run dev
```

#### Backend (NestJS)

```bash
cd backend/apps
npm run start:dev
```

---

### Local URLs

| Service      | URL                                                              |
| ------------ | ---------------------------------------------------------------- |
| Frontend App | [http://localhost:3000](http://localhost:3000)                   |
| Backend API  | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) |

---

## 📦 Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS, TypeScript
* **Backend:** NestJS, Supabase, Hydration SDK
* **Wallets:** EVM & Polkadot support
* **Automation:** Agent wallet, strategy simulation

---

## 📬 Contact

For questions, feedback, or contributions, please reach out via [Telegram](https://web.telegram.org/k/#@mtd_71).

---

**OceanFin — Navigate DeFi with confidence.**
