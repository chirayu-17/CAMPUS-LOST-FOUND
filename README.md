<div align="center">

# 🏫 Campus Lost & Found
### Institutional Property Recovery & AI Forensic Verification Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-campus--lost--found--evul.onrender.com-brightgreen?style=for-the-badge&logo=render)](https://campus-lost-found-evul.onrender.com)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

*A next-generation digital lost-and-found system engineered for academic institutions. Featuring algorithmic item matching, interactive campus mapping, forensic verification, and an intelligent Gemini AI assistant.*

[🌐 View Live Deployment](https://campus-lost-found-evul.onrender.com) • [✨ Key Features](#-key-features) • [🚀 Quick Start](#-quick-start) • [📐 Architecture](#-system-architecture)

---

</div>

## 🌟 Overview

Lost items on college campuses often remain unclaimed due to fragmented noticeboards, noisy WhatsApp groups, and lack of secure verification. 

**Campus Lost & Found** solves this by providing a unified, real-time institutional recovery portal. It bridges students who lost belongings with those who found them through:
- **AI Forensic Verification** to evaluate matching probabilities without exposing private identity markers.
- **Zero-Knowledge Ownership Challenge Questions** to prevent fraudulent handoffs.
- **Interactive Campus Spatial Mapping** to pinpoint recovery locations across college buildings.

---

## ✨ Key Features

### 🤖 1. AI Forensic Cross-Check Engine
* Powered by **Google Gemini AI (`@google/genai`)**.
* Analyzes lost vs. found reports using multi-point forensic inspection (brands, concealed tokens, inscriptions, wear-and-tear details).
* Outputs confidence percentages, rationale breakdowns, and automatically suggests **Verification Interrogation Questions** for secure handovers.

### 💬 2. "Chiroz" Gemini AI Campus Agent
* An embedded, real-time conversational AI assistant.
* Helps students search the lost-and-found database using natural language queries.
* Guides users through reporting lost items and drafting precise descriptions.

### 🗺️ 3. SDSM College Interactive Map Integration
* Built-in interactive campus map modal embedded directly from `sdsmcollegemap.netlify.app`.
* Allows students to inspect campus building zones (CC3, Library, Science Wing, Central Quad, Canteen, Sports Complex) and tag locations directly into reports.

### 📦 4. Comprehensive Categorization & Custom Items
* Pre-configured quick filters with custom icons:
  - 🍼 **Water Bottles** (Milton, Hydro, etc.)
  - ☂️ **Umbrellas**
  - 🎧 **Headphones & Earbuds**
  - 👓 **Eyeglasses & Sunglasses**
  - 🪪 **Student ID Cards & Badges**
  - 🔑 **Keys & Keychains**
  - 📱 **Smartphones**
  - 🔌 **Cables & Chargers**
  - ⌚ **Watches & Smartwatches**
  - 📦 **Custom / Other Items** (Enter custom category names freely)

### ⚡ 5. Real-Time Synchronized Public Ledger
* Live polling and instant feed synchronization showing active Lost declarations and Found recoveries.
* Real-time sync timestamp indicator with manual refresh and automated status checks.
* Instant item inspection and ownership claim submission flow.

### 🎨 6. Student Ergonomics & Institution Customization
* **Dark / Light Theme Toggle**: Persistent system-wide theme preference with custom contrast-locked search inputs.
* **Student Identity Profile**: Tracks Student Name, Roll Number, Year, Division, Faculty, and Photo.
* **Campus Crest Customization**: Select preset emblem shields or upload an official college emblem.
* **Haptic & Audio Feedback**: Micro-interactions engineered for both desktop and mobile web experiences.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons |
| **Backend** | Express.js, Node.js, RESTful API endpoints |
| **Artificial Intelligence** | Google Gemini API (`gemini-2.5-flash`), Forensic Prompt Engineering |
| **Spatial Mapping** | SDSM College Map (`sdsmcollegemap.netlify.app`) iframe integration |
| **Hosting & CI/CD** | Render (Web Service), GitHub Continuous Deployment |

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/campus-lost-and-found.git
cd campus-lost-and-found
