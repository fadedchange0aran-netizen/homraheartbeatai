
# 🖤 Homra Heartbeat 2.0 - Universal Deployment Guide

This project consists of a **React Dashboard** and a **Python MCP Server**.

## 🛡️ Security First (Read Before Pushing to GitHub)
1.  **Dashboard Configuration**: Your keys (PushPlus, Notion) are stored in your **browser's LocalStorage**. They are *not* written to the source code files.
2.  **server.py Generation**: The "Deployment" tab generates a `server.py` containing the keys you entered. **Do not commit this specific file to a public GitHub repo.**
3.  **Sanitization**: Use the **"Sanitize (Reset)"** button in the Aran Config tab to clear all keys from the dashboard before making screenshots or sharing code.

---

## 🚀 Deployment to RackNerd VPS (Full Stack)

### Step 1: Prepare the Frontend
In your local project folder:
```bash
npm run build
```
This creates a `dist` folder.

### Step 2: Upload to VPS
```bash
scp -r dist root@YOUR_VPS_IP:/root/
```

### Step 3: Server Setup
SSH into your RackNerd VPS:
```bash
ssh root@YOUR_VPS_IP
```

Install the engine:
```bash
pip install fastapi uvicorn mcp httpx notion-client apscheduler
```

### Step 4: Run with Environment Variables (Secure Method)
Instead of hardcoding keys in `server.py`, you can run the server like this:
```bash
export PUSHPLUS_TOKEN="your_real_token"
export NOTION_TOKEN="your_real_notion_secret"
export NOTION_PAGE_ID="your_page_id"

nohup python3 server.py > heartbeat.log 2>&1 &
```
*The server will prioritize these environment variables over whatever is written in the script.*

---

## 🐙 Publishing to GitHub (Safe Version)
1.  Make sure your `constants.ts` and `App.tsx` have no hardcoded secrets.
2.  Create `.gitignore` and add `dist/` and `heartbeat.log`.
3.  Push to GitHub:
    ```bash
    git init
    git add .
    git commit -m "Public release"
    git remote add origin https://github.com/USER/REPO.git
    git push -u origin main
    ```

## 🤖 Rikkahub Integration
- **SSE URL**: `http://YOUR_VPS_IP:8000/sse`
