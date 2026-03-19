# MediVoice AI Clinical Dashboard 🏥🎙️
MediVoice AI is a real-time clinical assistant designed for Emergency Departments and healthcare providers. It uses high-speed AI to analyze patient symptoms and provides filtered clinical assessments, differential diagnoses, and recommended actions using voice as a primary interface.
! [Dashboard Preview]  (https://medivoice-ai-production.up.railway.app/)
## 🚀 Key Features
1. **Real-time Voice Intelligence**: Capture patient symptoms via microphone or text with instant transcription.
2. **Blazing Fast AI Analysis (Groq)**: Near-instant clinical reasoning and assessment powered by **Llama 3.3**.
3. **Multilingual Patient Communication (Murf AI)**: Natural voice responses in English and Hindi for diverse patient needs.
4. **Dynamic Vitals Monitoring**: Live simulation of HR, BP, SPO2, and Temperature with threshold alerts.
5. **Differential Dx & Confidence**: Real-time tracking of potential diagnoses with accuracy confidence scores.
6. **Integrated Clinical Orders**: Smart suggestions for ECG, imaging, and blood work based on AI findings.
7. **Premium Glassmorphism Design**: A sleek, modern, and responsive UI optimized for medical environments.
## 🛠️ Tech Stack
- **Frontend**: Vanilla JavaScript, CSS3 (Modern Glassmorphism), HTML5.
- **Backend**: Node.js, Express.
- **AI Reasoning**: Groq API (Llama-3.3-70b-versatile).
- **Speech Synthesis**: Murf AI API.
- **Deployment**: Optimized for Railway.app.
## ⚙️ Setup & Installation
### 1. Prerequisites
- Node.js (v18 or higher)
- A Groq API Key ([console.groq.com](https://console.groq.com))
- A Murf AI API Key ([murf.ai/api](https://murf.ai))
### 2. Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/bhaskar2006-hub/medivoice-ai.git
   cd medivoice-ai
2. Install dependencies:
```bash
 npm install
  Create a .env file in the root directory:
  env
  GROQ_API_KEY=your_groq_key
  MURF_API_KEY=your_murf_key
   PORT=3001
   Start the server:
    bash
   npm start
  Open http://localhost:3001 in your browser.```
3.☁️ Deployment (Railway)
Connect your GitHub repository to Railway.app.
Add the following Environment Variables in the Railway dashboard:
GROQ_API_KEY
MURF_API_KEY
Railway will automatically detect the package.json and deploy your app.
📄 License
This project is for educational/demonstration purposes in clinical AI workflows.

Disclaimer: This is an AI-assisted clinical tool. All medical decisions must be verified by a licensed physician.

