# PES 2025 Analytics Dashboard

A full-stack Next.js app to track and analyze your PES 2025 match performance using OCR screenshot parsing.

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** — dark gamer theme
- **MongoDB + Mongoose** — match data storage
- **Tesseract.js** — OCR screenshot analysis
- **Recharts** — goals-by-team bar chart
- **Lucide React** — icons

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up MongoDB
Either install MongoDB locally, or create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).

Edit `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/pes2025
# OR for Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pes2025
```

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

### 📤 Upload & OCR
1. Drag & drop a PES match result screenshot onto the upload zone
2. Tesseract.js extracts text from the image
3. The parser scans for: score, shots, shots on target, possession, match rating
4. A **Review Modal** pops up — verify & correct any OCR errors before saving

### ✏️ Manual Entry Fallback
Click **Manual Entry** in the nav to add a match without a screenshot (perfect when OCR fails).

### 📊 Dashboard Stats
- **Average Match Rating** (from OCR-extracted ratings)
- **Shot Accuracy** (on target / total)
- **Goals Per Game**
- **Best Team** (most wins)

### 📋 Match History Table
- Date, Team Used, Opponent, Score (color-coded W/D/L), Shots (on target), Possession
- **View** each match in a detail modal
- **Delete** matches

### 📈 Goals by Team Chart
Bar chart showing total goals scored with each team.

---

## OCR Tips for Best Results
- Use **high-resolution** screenshots (1080p+)
- Make sure the **final score screen** is fully visible
- Avoid screenshots with overlays or popups
- If OCR confidence is low, use the fallback form fields in the Review Modal

---

## Project Structure
```
pes-analytics/
├── app/
│   ├── api/
│   │   ├── matches/
│   │   │   ├── route.js          # GET all matches + stats, POST new match
│   │   │   └── [id]/route.js     # DELETE match by ID
│   │   └── parse-match/
│   │       └── route.js          # POST image → Tesseract OCR → parsed data
│   ├── globals.css               # Dark gamer theme, custom fonts
│   ├── layout.js
│   └── page.js                   # Full dashboard UI
├── lib/
│   └── mongodb.js                # Mongoose connection singleton
├── models/
│   └── Match.js                  # Match schema (auto-calculates W/D/L)
├── .env.local                    # MONGODB_URI config
└── package.json
```
