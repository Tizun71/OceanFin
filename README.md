<div align="center">
  <img src="https://ocean-fin.s3.ap-southeast-1.amazonaws.com/logo-ocean-fin.png" alt="OceanFin Logo" width="120" height="120" />

  <h1>Ocean Fin</h1>
</div>

# About OceanFin

**Optimizing Polkadot DeFi Earnings**

OceanFin is a non-custodial platform that maximizes your Polkadot DeFi earnings with automated, data-driven strategies—no middlemen, just high-yield opportunities.

---

## 🚀 Features

* **Non-custodial:** Users retain 100% control of assets
* **DeFi Builder:** Visual drag-and-drop interface for composing complex strategies
* **AI-Powered Strategy Generation:** Create strategies from natural language prompts
* **One-Click Execution:** Eliminate manual protocol hopping and spreadsheet math
* **Real-time Simulation:** Preview strategy outcomes before execution
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

## 🎨 Key Features

### DeFi Builder - Visual Strategy Composer

Build complex DeFi strategies with a drag-and-drop interface. No coding required.

**Key Features:**
* Visual workflow canvas powered by ReactFlow
* Drag-and-drop operation nodes (SWAP, SUPPLY, BORROW, JOIN_STRATEGY)
* Smart connection validation with business rules
* Real-time price estimation and APY calculations
* Interactive configuration panels
* One-click strategy deployment

**Supported Operations:**
* `SWAP` - Exchange tokens via Hydration DEX
* `SUPPLY` - Deposit tokens to lending pools
* `BORROW` - Borrow tokens against collateral
* `JOIN_STRATEGY` - Convert to liquid staking derivatives (GDOT/VDOT)
* `ENABLE_E_MODE` - Enable efficiency mode for higher LTV

**Access:** Navigate to `/builder` in the app

---

### AI Prompt to Strategy

Generate executable DeFi strategies from natural language using Google Gemini AI.

**How it works:**
1. Describe your strategy in plain English
2. AI generates a complete strategy with validation
3. Review the visual preview and risk analysis
4. Execute with one click

**Example Prompts:**
* "Create a gdot looping 3 loops"
* "Supply DOT and borrow USDC"
* "Maximize yield with moderate risk"

**Features:**
* Natural language processing with Gemini AI
* Automatic strategy validation
* Real-time simulation with accurate amounts
* AI-powered risk analysis
* Interactive strategy preview

**Access:** Navigate to `/prompt` in the app

---

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend (Next.js)"]
        Home[Home Dashboard]
        Builder[DeFi Builder<br/>Visual Editor]
        Prompt[AI Prompt<br/>Strategy Generator]
    end
    
    subgraph Backend["⚙️ Backend (NestJS)"]
        subgraph AIModule["AI Strategy Builder Module"]
            Gemini[Gemini AI Service]
            Parser[Strategy Parser]
            Validator[Strategy Validator]
        end
        
        subgraph StrategyModule["DeFi Strategies Module"]
            Simulation[Simulation Service]
            Execution[Execution Service]
            Tracking[Activity Tracking]
        end
        
        subgraph DefiModule["DeFi Modules"]
            Hydration[Hydration SDK]
            Pairs[Token Pairs Service]
            Actions[Actions Service]
        end
    end
    
    subgraph Blockchain["⛓️ Blockchain Layer"]
        HydrationChain[Hydration Parachain]
        AssetHub[Asset Hub<br/>Planned]
        Others[Other Parachains<br/>Planned]
    end
    
    Frontend -->|REST API| Backend
    Backend -->|Polkadot.js / SDK| Blockchain
    
    Gemini --> Parser
    Parser --> Validator
    Validator --> Simulation
    
    style Frontend fill:#1e293b,stroke:#4f46e5,stroke-width:2px,color:#fff
    style Backend fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#fff
    style Blockchain fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff
    style Gemini fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style HydrationChain fill:#06b6d4,stroke:#0891b2,color:#fff
```

### Data Flow

#### 1. DeFi Builder Flow

```mermaid
graph TD
    A[User Action: Drag & Drop] --> B[Add Node to Canvas]
    B --> C[Configure Node<br/>Token, Amount]
    C --> D[Fetch Estimate API]
    D --> E[Hydration SDK]
    E --> F[Live Prices]
    F --> G[Display Preview]
    G --> H[Connect Nodes<br/>Validate Rules]
    H --> I[Create Strategy]
    I --> J[Execute on Blockchain]
    
    style A fill:#4f46e5,stroke:#4338ca,color:#fff
    style J fill:#10b981,stroke:#059669,color:#fff
    style D fill:#f59e0b,stroke:#d97706,color:#fff
    style H fill:#ec4899,stroke:#db2777,color:#fff
```

#### 2. AI Prompt to Strategy Flow

```mermaid
graph TD
    A[User Prompt<br/>Natural Language] --> B[Gemini AI Service]
    B --> C[Parse Intent]
    C --> D[Strategy Parser]
    D --> E[Structure Steps]
    E --> F[Strategy Validator]
    F --> G[Check Business Rules]
    G --> H[Simulation Service]
    H --> I[Calculate Amounts]
    I --> J[Risk Analyzer]
    J --> K[Assess Risk Level]
    K --> L[Display Preview]
    L --> M[User Approval]
    M --> N[Execute on Blockchain]
    
    style A fill:#4f46e5,stroke:#4338ca,color:#fff
    style B fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style F fill:#ec4899,stroke:#db2777,color:#fff
    style H fill:#f59e0b,stroke:#d97706,color:#fff
    style J fill:#ef4444,stroke:#dc2626,color:#fff
    style N fill:#10b981,stroke:#059669,color:#fff
```

### Key Components

**Frontend:**
- **ReactFlow Canvas:** Visual workflow editor for DeFi Builder
- **AI Prompt Interface:** Natural language input for strategy generation
- **Strategy Preview:** Interactive visualization of generated strategies
- **Wallet Integration:** Polkadot.js and EVM wallet support

**Backend:**
- **AI Strategy Builder:** Gemini AI integration for NLP
- **Strategy Simulation:** Accurate amount calculations with live prices
- **DeFi Modules:** Protocol integrations (Hydration, Asset Hub, etc.)
- **Validation Engine:** Business rules enforcement

**Blockchain:**
- **Hydration Parachain:** Primary DeFi protocol
- **Polkadot Relay Chain:** Cross-chain messaging (XCM)
- **Smart Contracts:** Substrate pallets for DeFi operations

### Technology Stack by Layer

| Layer          | Technologies                                      |
| -------------- | ------------------------------------------------- |
| **Frontend**   | Next.js 14, React 18, TypeScript, Tailwind CSS   |
| **UI Library** | ReactFlow, Radix UI, Framer Motion, shadcn/ui    |
| **Backend**    | NestJS, TypeScript, Clean Architecture (DDD)     |
| **Database**   | Supabase (PostgreSQL)                            |
| **AI**         | Google Gemini AI (gemini-1.5-pro)                |
| **Blockchain** | Polkadot.js, Hydration SDK, XCM                  |
| **Wallets**    | Polkadot.js Extension, MetaMask, Luno Kit        |
| **DevOps**     | Railway, GitHub Actions, Docker (planned)        |

---

## 📦 Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS, TypeScript, ReactFlow
* **Backend:** NestJS, Supabase, Hydration SDK
* **AI:** Google Gemini AI (gemini-1.5-pro)
* **Blockchain:** Polkadot.js, Hydration SDK, XCM
* **Wallets:** EVM & Polkadot support (MetaMask, Polkadot.js, Talisman)
* **Automation:** Agent wallet, strategy simulation

---

## 🛠️ Current Status

| Status | Feature                                    |
| ------ | ------------------------------------------ |
| ✅      | EVM account binding & wallet connect       |
| ✅      | Loop strategies: GDOT & VDOT               |
| ✅      | Strategy simulation & execution            |
| ✅      | Activity tracking & progress updates       |
| ✅      | Supported DEFI Protocols on Hydration      |
| ✅      | **DeFi Builder - Visual strategy composer**|
| ✅      | **AI Prompt to Strategy with Gemini AI**   |

---

## 🗓️ Roadmap

* [x] Stable Dapp
* [x] DEFI Protocols on Hydration
* [x] **DeFi Builder - Visual workflow editor**
* [x] **AI-Powered Strategy Generation**
* [ ] DEFI Protocols on Asset Hub
* [ ] DEFI Protocols on Bifrost
* [ ] DEFI Protocols on Moonbeam
* [ ] Withdraw Strategies
* [ ] Executing by Agent Wallet (x402 Protocol)
* [ ] Cross-chain XCM
* [ ] More Strategies
* [ ] Metrics and Monitors
* [ ] Apply Grants

---

## ⚡ Getting Started

Ready to dive in? Check out our comprehensive setup guide:

👉 **[Quick Start Guide](./QUICK_START.md)** - Complete installation and setup instructions

**What you'll find:**
- Prerequisites and environment setup
- Step-by-step installation guide
- Local development server configuration
- Usage examples for DeFi Builder and AI Prompt
- Troubleshooting common issues


## 📬 Contact

For questions, feedback, or contributions, please reach out via [Telegram](https://web.telegram.org/k/#@mtd_71).

---

**OceanFin — Navigate DeFi with confidence.**
