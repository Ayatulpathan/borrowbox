# BorrowBox Cloud Deployment Guide 🚀☁️

This guide explains how to deploy **BorrowBox** entirely to the cloud using free-tier providers without running anything on your local computer.

---

## 🛠️ Step 1: Set up Free MongoDB Atlas Database (3 mins)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in.
2. Click **Create Cluster** $\rightarrow$ select the **M0 Free Shared Tier**.
3. Under **Database Access**, create a database user (e.g. `borrowbox_user` with a secure password).
4. Under **Network Access**, click **Add IP Address** $\rightarrow$ Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** $\rightarrow$ **Drivers** $\rightarrow$ Copy your connection URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/borrowbox?retryWrites=true&w=majority
   ```

---

## 🤖 Step 2: Get Free Google Gemini API Key (1 min)

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** $\rightarrow$ **Create API key**.
3. Copy your API key (starts with `AIzaSy...`).

---

## 🌐 Step 3: Deploy Backend API to Render (Free) (3 mins)

1. Go to [Render.com](https://render.com/) and sign in with your GitHub account (`Ayatulpathan`).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your repository: `https://github.com/Ayatulpathan/borrowbox`.
4. Configure the service settings:
   - **Name**: `borrowbox-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = *(Your MongoDB Atlas URI from Step 1)*
   - `JWT_SECRET` = *(Any random 32-character string)*
   - `CLIENT_URL` = *(Your Vercel/Render frontend URL from Step 4)*
   - `GEMINI_API_KEY` = *(Your Gemini key from Step 2)*
   - `GEMINI_MODEL` = `gemini-1.5-flash`
6. Click **Deploy Web Service**.
7. Copy your backend URL (e.g., `https://borrowbox-api.onrender.com`).

*(Optional: To populate initial sample marketplace listings and users in the cloud database, go to Render's **Shell** tab and run `npm run seed`)*.

---

## ⚡ Step 4: Deploy Frontend to Vercel (Free) (2 mins)

1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select the `borrowbox` repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: click **Edit** and choose `client`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://borrowbox-api.onrender.com/api/v1` *(Your Render backend URL + `/api/v1`)*
6. Click **Deploy**.
7. Your frontend is live at `https://borrowbox.vercel.app`!

---

## 🔄 Automatic Continuous Deployment (CI/CD)

Whenever you push commits to `master` on `https://github.com/Ayatulpathan/borrowbox`, Vercel and Render will automatically build and deploy the updates in the cloud!
