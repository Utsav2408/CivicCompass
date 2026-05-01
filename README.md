# 🗳️ CivicCompass
*Your Personalized Election Companion*

---

## The Problem

Most Indian voters — especially first-timers — have no idea how the election process actually works. When is the last day to check the voter roll? What happens between nomination and polling day? Where exactly is my booth? Who is standing from my constituency, and what have they declared?

The information exists, but it's scattered across government portals that are hard to navigate, unavailable in Hindi, and completely inaccessible on a slow mobile connection.

On election day itself — the one day it all matters — many voters arrive underprepared or not at all.

---

## The Solution

CivicCompass is a Progressive Web App that puts everything a voter needs in one place, in plain language, in English or Hindi, and works even when the internet doesn't.

- **Countdown + timeline** — see exactly where the election stands today and what comes next
- **Step-by-step process guide** — the full election process explained simply, with an AI assistant for follow-up questions grounded in ECI sources
- **Ward intelligence** — party performance charts and candidate affidavit summaries for your constituency
- **Find your booth** — your polling booth pre-pinned on a map, with directions and nearby police stations
- **Support + SOS** — raise election complaints as tickets, and a one-tap emergency button for election day

All AI-generated content cites its source. All core screens work offline. The app costs under $0.15 to run for the entire 8-day challenge window.

---

## Stack

Vite · React · TypeScript · Firebase · Gemini 2.0 Flash · Google Maps · Tailwind

---

## Running Locally

```bash
npm install
firebase emulators:start
npm run seed       # loads test data
npm run dev        # http://localhost:5173
```

---

*Google Prompt War Challenge · Every Indian deserves to understand their vote.*