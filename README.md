# 🛡️ LogLens: SIEM-Lite Threat Detection
**An Enterprise-Grade Log Analysis Tool for SysAdmins**

LogLens is a specialized Security Information and Event Management (SIEM) tool designed to parse unstructured web server logs (Nginx/Apache) and identify malicious activity using high-performance Regex signatures.

## 🚀 Phase 1-4 Implementation
- **Phase 1 (Parser):** Implemented a **Node.js Stream-based parser** to process 500MB+ logs line-by-line without high RAM usage.
- **Phase 2 (Detection):** Signature-based engine detecting **SQLi, XSS, Path Traversal, and Shell Injection** using an external `signatures.json` database.
- **Phase 3 (Visuals):** Real-time dashboard built with **React & Recharts**, featuring threat distribution and Geo-IP simulation.
- **Phase 4 (Optimization):** Includes an **Evaluator Demo Mode** for instant data visualization.

## 🛠️ Tech Stack
- **Frontend:** React.js, Lucide Icons, Recharts (Data Viz)
- **Backend:** Node.js, Express, Multer (File Handling)
- **Security:** Signature-based pattern matching (Regex)

## 📦 Installation & Setup
1. **Clone the repo:** `git clone https://github.com/YOUR_USERNAME/LogLens-SIEM.git`
2. **Setup Server:** `cd server && npm install && node index.js`
3. **Setup Client:** `cd client && npm install && npm run dev`
4. **Access UI:** Open `http://localhost:5173`