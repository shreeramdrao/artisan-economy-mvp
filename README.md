# 🛍️ Artisan Economy – AI-Powered Marketplace for Indian Artisans

## 🚀 Overview
**Artisan Economy** is a full-stack AI-powered marketplace that empowers Indian artisans to sell their handcrafted products globally.  
The platform integrates **AI, payments, and automation** to make artisan businesses sustainable and competitive.

✅ **Seller Side** – Upload products, get AI-powered price suggestions, manage orders & revenue.  
✅ **Buyer Side** – Browse authentic artisan products, add to cart, and purchase securely via Stripe.  
✅ **AI Features** – Product storytelling, price suggestions, image enhancement, and voice-based interactions.  

This project was built as part of the **GenAI Exchange Hackathon**.

---

## 🌟 Features

### 🎨 Seller Features
- Register/Login as seller
- Upload products with images & audio storytelling
- AI-powered **Price Suggestion**
- Seller Dashboard: Orders, Payments, Revenue Analytics
- Manage products (edit/update)

### 🛒 Buyer Features
- Register/Login as buyer
- Browse artisan products
- Add to Cart & Buy Now options
- Stripe integration for secure payments
- Order history with delivery details

### 🤖 AI Features
- Product storytelling (voice-to-text & AI polish)
- AI-enhanced product images
- Automated Instagram captions for artisans
- Price optimization based on category, material, and effort

---

## 🏗️ Architecture

**Tech Stack:**
- **Frontend**: Next.js 14, TailwindCSS, TypeScript  
- **Backend**: NestJS, Node.js, Express  
- **Database/Cloud**: Google Firestore, Google Cloud Storage  
- **AI/ML**: Vertex AI (Gemini), Custom AI modules, Remove.bg, Canva API  
- **Payments**: Stripe, Razorpay  
- **Deployment**: Google Cloud Run (frontend + backend)  

**High-Level Flow:**
1. Buyer/Seller → Next.js Frontend  
2. API requests → NestJS Backend (Auth, Seller, Buyer, AI services)  
3. Database & Storage → Firestore + GCS  
4. Payments → Stripe Checkout + Razorpay  
5. AI services → Vertex AI + custom ML modules  

---

## 🌐 Live Prototype Links

- **Frontend (Buyer & Seller portal)**: [https://artisan-frontend-188692597311.asia-south1.run.app](https://artisan-frontend-188692597311.asia-south1.run.app)  
- **Backend (API)**: [https://artisan-backend-in6bgnvyxa-el.a.run.app/api](https://artisan-backend-in6bgnvyxa-el.a.run.app/api)

---


## 🛠️ How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/shreeramdrao/artisan-economy-mvp.git
cd artisan-economy-mvp
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create `.env` file with:
```env
PORT=4000
GC_PROJECT_ID=your_project_id
GCS_BUCKET_NAME=your_bucket
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
REMOVE_BG_API_KEY=your_key
CANVA_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_key
FRONTEND_URL=http://localhost:3000
```

Run:
```bash
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create `.env.local` file with:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api
```

Run:
```bash
npm run dev
```

---

## 🎥 Demo Video

You can watch the working demo of Artisan Economy here:  
[👉 Click to Watch Demo Video](https://drive.google.com/file/d/1qgWfbbR4pu4acDozT9Vp3Kjv2L9kcbIa/view?usp=sharing)


---

## 📜 License
This project is developed for **GenAI Exchange Hackathon**.  
For educational and demonstration purposes only.
