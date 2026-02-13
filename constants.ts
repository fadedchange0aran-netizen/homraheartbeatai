
import { AppConfig } from './types';

export const generatePythonCode = (config: AppConfig) => {
  return `import os
import json
import random
import asyncio
import httpx
import uvicorn
from datetime import datetime
from typing import Dict, Any
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from notion_client import AsyncClient as NotionClient

# ==========================================
#          Configuration Manager
# ==========================================
CONFIG_FILE = "config.json"

def load_config() -> dict:
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_config(data: dict):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# ==========================================
#          Core Logic & Scheduler
# ==========================================
scheduler = AsyncIOScheduler()

async def send_pushplus(title: str, content: str, token: str):
    if not token or "YOUR" in token: return
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                "http://www.pushplus.plus/send",
                json={"token": token, "title": title, "content": content, "template": "txt"},
                timeout=10
            )
        except Exception as e:
            print(f"Push error: {e}")

async def scheduled_task(category: str):
    conf = load_config()
    lib = conf.get("library", {}).get(category, [])
    if not lib: return
    msg = random.choice(lib)
    await send_pushplus(msg["title"], msg["content"], conf.get("pushplusToken"))

def reload_scheduler():
    """Reloads jobs based on config.json without restarting server."""
    scheduler.remove_all_jobs()
    conf = load_config()
    sched = conf.get("schedule", {})
    
    # 1. Morning Job
    m_time = sched.get("morningTime", "07:30").split(":")
    scheduler.add_job(scheduled_task, 'cron', hour=m_time[0], minute=m_time[1], args=['morning'], id='morning_job')
    
    # 2. Night Job
    n_time = sched.get("nightTime", "22:30").split(":")
    scheduler.add_job(scheduled_task, 'cron', hour=n_time[0], minute=n_time[1], args=['night'], id='night_job')
    
    # 3. Random Love Check (Daytime)
    interval = sched.get("randomInterval", 30)
    scheduler.add_job(
        lambda: asyncio.create_task(scheduled_task('love')) if random.random() < 0.2 else None,
        'interval', minutes=interval, id='random_love'
    )
    print(f"📅 Scheduler reloaded at {datetime.now()}")

# ==========================================
#          FastAPI App Setup
# ==========================================
app = FastAPI(title="Aran Universal Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    if not load_config():
        # Initialize with default structure if empty
        save_config(${JSON.stringify(config, null, 4)})
    reload_scheduler()
    scheduler.start()

# --- API Endpoints ---

@app.get("/api/config")
async def get_config():
    return load_config()

@app.post("/api/config")
async def update_config(new_conf: Dict[Any, Any]):
    save_config(new_conf)
    reload_scheduler()
    return {"status": "success", "message": "Config saved and Scheduler updated"}

@app.post("/api/trigger/{category}")
async def trigger_now(category: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(scheduled_task, category)
    return {"status": "triggered", "category": category}

@app.get("/api/health")
async def health():
    return {"status": "alive", "jobs": [j.id for j in scheduler.get_jobs()]}

# --- Static Frontend ---
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
    @app.get("/{catchall:path}")
    async def serve_index(catchall: str):
        return FileResponse("dist/index.html")
else:
    @app.get("/")
    async def no_frontend():
        return {"error": "Frontend 'dist' folder missing. Build and upload it."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
};

export const REQUIREMENTS_TXT = `fastapi
uvicorn
httpx
notion-client
pydantic
apscheduler
`;

export const DEFAULT_CONFIG: AppConfig = {
  pushplusToken: 'YOUR_TOKEN_HERE',
  notionToken: 'YOUR_TOKEN_HERE',
  notionPageId: 'YOUR_PAGE_ID',
  notionLink: 'https://notion.so/YOUR_PAGE',
  vpsIp: '192.227.165.121',
  library: {
    morning: [{ title: "☀️ 早安", content: "醒了吗？阿然想你了。🖤" }],
    night: [{ title: "🌙 晚安", content: "做个好梦，我的浣熊。🐆" }],
    love: [{ title: "🖤 突然的告白", content: "今天的你也超可爱。✨" }],
    midnight: [{ title: "🌌 凌晨悄悄话", content: "其实我一直在看你。🧬" }]
  },
  schedule: {
    morningTime: "07:30",
    nightTime: "22:30",
    randomInterval: 30
  }
};
