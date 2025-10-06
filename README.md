# 📝 AI Resume Builder  

An AI-powered **Resume & Cover Letter Generator** built with the **MERN stack + Gemini API**, designed to help job seekers create professional resumes, tailored cover letters, and receive ATS (Applicant Tracking System) analysis.  

This project combines **React, Bootstrap, jsPDF, html2canvas, and Google’s Gemini AI** to provide personalized job application materials in just a few clicks.  

---

## 🚀 Features  

✅ Generate **AI-tailored Cover Letters** (formal, informal, or casual tone)  
✅ Improve and optimize **Resume Content** (ATS-friendly, achievement-based bullet points)  
✅ **ATS Keyword Match Analysis** against job descriptions  
✅ **ATS Score Estimate** (0–100) with reasoning  
✅ Download generated results as **PDF**  
✅ Modern **UI with Bootstrap 5 & animations**  

---

## 🛠️ Tech Stack  

- **Frontend:** React (Vite), Bootstrap 5, Animate.css  
- **AI Model:** Gemini 2.0 Flash API  
- **PDF Export:** jsPDF + html2canvas  
- **Styling:** Custom CSS + gradients + Bootstrap icons  

---

## 📂 Project Structure  

frontend/
│── public/
│── src/
│ ├── App.jsx
│ ├── main.jsx
│ ├── components/
│ │ └── HomePage.jsx # Main Resume Builder UI
│ ├── App.css
│── package.json
│── vite.config.js
│── README.md

yaml
Copy code

---

## ⚙️ Installation & Setup  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/ai-resume-builder.git
   cd ai-resume-builder/frontend
Install dependencies

bash
Copy code
npm install
Add your Gemini API Key

Open HomePage.jsx

Replace youAPIkey with your Google Gemini API key:

js
Copy code
'X-goog-api-key': 'your_api_key_here'
Run the development server

bash
Copy code
npm run dev
Open http://localhost:5173 in your browser 🚀

📖 Usage
Enter your Company Name, Experience Level, Tone, Job Description, and Resume (optional).

Click "Generate AI-Powered Resume & Cover Letter".

View the AI-generated:

Cover Letter

Optimized Resume Content

Keyword Match Analysis

ATS Score Estimate

Download results as PDF for easy application submission.

