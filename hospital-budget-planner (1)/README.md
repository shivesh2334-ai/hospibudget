# 🏥 HospiBudget — Department Budget Planner

A comprehensive budget planning tool for corporate hospital departments, covering **Equipment**, **Maintenance**, and **Manpower** requirements.

---

## ✨ Features

### 📊 Dashboard & Analytics
- Grand total budget summary with distribution charts
- CapEx vs OpEx breakdown with visual progress indicators
- Equipment budget by category (bar chart)
- Manpower vs Equipment vs Maintenance pie chart

### 🏥 Equipment Budget
- Add unlimited equipment items with full detail
- **CapEx / OpEx** classification (best practice: replacements = CapEx, repairs = OpEx)
- Service lifecycle tracking with replacement year projection
- Annual maintenance cost auto-calculation (% of asset value)
- Priority levels: Critical / High / Medium / Low
- Vendor, model, category tracking

### 🔧 Maintenance Budget
- AMC, CMC, Preventive Maintenance, Calibration & more
- Link maintenance contracts to specific equipment items
- Contract start/end date tracking with SLA notes
- Suggested maintenance budget from equipment % entries
- Corrective / breakdown budget planning

### 👥 Manpower Budget
- Full CTC calculator: Gross + HRA + TA + PF/ESIC + Gratuity + Medical + Incentive
- Standard NABH-aligned designations (Senior Consultant → Housekeeping)
- Headcount planning with custom role support
- Annual CTC auto-calculated per role group

### 💾 Data & Export
- Auto-saved to browser localStorage (no login required)
- Export to **CSV** for Excel/Sheets import
- Export to **JSON** for backup and data portability
- Department selector (18+ hospital departments)

---

## 🚀 Deployment

### Option A: Deploy via GitHub + Vercel (iPad-friendly, browser-only)

1. **Fork / Push to GitHub** (use github.dev or Working Copy on iPad):
   - Go to [github.com](https://github.com) → New Repository → `hospital-budget-planner`
   - Upload all files (drag & drop in browser or use Working Copy app)

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) → Add New Project
   - Import your GitHub repository
   - Framework: **Next.js** (auto-detected)
   - Click **Deploy** — done in ~2 minutes!

3. **Environment**: No `.env` variables needed. All data is stored client-side.

### Option B: Run Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Option C: Build for production

```bash
npm install
npm run build
npm start
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Sora (display) + Inter (body) + JetBrains Mono |
| Storage | Browser localStorage |
| Export | Native File API (CSV/JSON) |
| Deployment | Vercel (recommended), any Node.js host |

---

## 📐 Best Practices Implemented

Based on research from NABH, AHA, and hospital finance literature:

- **CapEx vs OpEx distinction** — Equipment purchase/replacement = Capital, repair/maintenance = Operational (HFM Magazine guidelines)
- **Lifecycle planning** — Service life tracking with replacement year projections (Helmer Inc. methodology)
- **Priority scoring** — Critical > High > Medium > Low for budget allocation decisions
- **Maintenance % benchmarks** — Default 8% of asset value for biomedical equipment AMC
- **Rolling budget concept** — Year-selectable budgets with carry-forward via JSON export
- **Full CTC calculation** — Includes PF (12%), Gratuity (4.81%), HRA, TA, Medical Allowance as per Indian labour norms
- **AMC vs CMC distinction** — AMC (parts excluded) vs CMC (comprehensive) for budget accuracy

---

## 🏥 Supported Departments

Cardiology & CTVS, Cardiac Catheterisation Lab, Cardiac ICU, ICU, Emergency & Trauma, Radiology & Imaging, Operation Theatre, Orthopaedics, Neurology & Neurosurgery, Oncology & Radiotherapy, Nephrology & Dialysis, Pulmonology, Gastroenterology, Paediatrics & NICU, Pathology & Laboratory, Pharmacy, Administration & HR, Facilities & Engineering

---

## 📁 Project Structure

```
hospital-budget-planner/
├── app/
│   ├── globals.css        # Design system, animations, component styles
│   ├── layout.jsx         # Root layout with metadata
│   └── page.jsx           # Entry point → BudgetPlanner
├── components/
│   └── BudgetPlanner.jsx  # Full app (Equipment + Maintenance + Manpower + Summary)
├── public/                # Static assets
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.js
├── vercel.json            # Vercel deployment config (region: bom1 = Mumbai)
├── package.json
└── .gitignore
```

---

## 🔒 Data Privacy

All budget data is stored **only in your browser** via `localStorage`. Nothing is sent to any server. For team use, export JSON and share the file, or integrate a backend (Firebase, Supabase, etc.) in a future version.

---

## 📧 Support

Built for **EasyMyCare** and Max Super Speciality Hospital finance planning workflows.

---

*HospiBudget v1.0 · Next.js 14 · MIT License*
