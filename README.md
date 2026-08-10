# Mini Mart System

A starter Mini Mart management system based on the uploaded Figma Mini Mart design.

## Included modules
- Login
- Dashboard
- POS / Checkout
- Products
- Stock / Inventory
- Purchases
- Suppliers
- Customers
- Reports
- Expenses
- Employees
- Settings

## Technology
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Frontend: HTML + CSS + JavaScript (browser app)
- API: REST
- GitHub-ready repository structure

## Requirements
- Node.js 18+
- MongoDB local OR MongoDB Atlas
- A browser

## 1. Run backend
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Linux/macOS:
```bash
cp .env.example .env
```

Backend runs at:
http://localhost:5000

Health check:
http://localhost:5000/api/health

## 2. Run frontend
Open `frontend/index.html` in a browser, or serve the project with VS Code Live Server.

The frontend is configured to call:
http://localhost:5000/api

## MongoDB
Default local connection:
mongodb://127.0.0.1:27017/minimart

For MongoDB Atlas, put your connection string in `.env`.

## GitHub
```bash
git init
git add .
git commit -m "Initial Mini Mart system"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Do NOT commit `.env`.
