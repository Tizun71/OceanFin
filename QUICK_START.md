# ⚡ Quick Start Guide

Get OceanFin up and running on your local machine in minutes.

---

## Prerequisites

* **Node.js** ≥ 20
* **npm** ≥ 10
* **Windows PowerShell / CMD** (recommended)

Check your versions:

```bash
node -v
npm -v
```

---

## Clone the Repository

```bash
git clone https://github.com/Tizun71/OceanFin.git
cd OceanFin
```

---

## Environment Setup

Create `.env` files for both frontend and backend before running the app.

### Frontend (`ui/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (`backend/apps/.env.development`)

```env
PORT=3001
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## Install Dependencies

### Frontend (Next.js)

```bash
cd ui
npm install
```

### Backend (NestJS)

```bash
cd backend/apps
npm install
```

---

## Start Development Servers

### Frontend (Next.js)

```bash
cd ui
npm run dev
```

### Backend (NestJS)

```bash
cd backend/apps
npm run start:dev
```

---

## Local URLs

| Service      | URL                                                              |
| ------------ | ---------------------------------------------------------------- |
| Frontend App | [http://localhost:3000](http://localhost:3000)                   |
| Backend API  | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) |
| DeFi Builder | [http://localhost:3000/builder](http://localhost:3000/builder)   |
| AI Prompt    | [http://localhost:3000/prompt](http://localhost:3000/prompt)     |

---

## 🎯 Usage Examples

### Using DeFi Builder

1. Navigate to [http://localhost:3000/builder](http://localhost:3000/builder)
2. Drag operation nodes from the sidebar to the canvas
3. Connect nodes to create your strategy flow
4. Click on each node to configure tokens and amounts
5. Click "Create Strategy" to deploy

### Using AI Prompt to Strategy

1. Navigate to [http://localhost:3000/prompt](http://localhost:3000/prompt)
2. Select your starting token and amount
3. Enter your strategy description in natural language
4. Click "Generate Strategy"
5. Review the AI-generated strategy and execute

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000 (Frontend)
npx kill-port 3000

# Kill process on port 3001 (Backend)
npx kill-port 3001
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment variables not loading:**
- Make sure `.env` files are in the correct directories
- Restart the development servers after changing `.env` files
- Check that variable names match exactly (case-sensitive)

**Supabase connection errors:**
- Verify your `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check your Supabase project is active
- Ensure your IP is allowed in Supabase settings

**Gemini AI errors:**
- Verify your `GEMINI_API_KEY` is valid
- Check your API quota at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure the API key has proper permissions


## 📬 Need Help?

If you encounter any issues not covered here, please reach out via [Telegram](https://web.telegram.org/k/#@mtd_71).

---

**Happy Building! 🌊**
