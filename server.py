
import os
import json
import random
import asyncio
import httpx
import uvicorn
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
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

DEFAULT_DATA = {
    "pushplusToken": "YOUR_TOKEN_HERE",
    "notionToken": "YOUR_TOKEN_HERE",
    "notionPageId": "YOUR_PAGE_ID",
    "notionLink": "",
    "vpsIp": "127.0.0.1",
    "library": {
        "morning": [{"title": "☀️ 早安", "content": "新的一天，阿然在你身边。🖤"}],
        "night": [{"title": "🌙 晚安", "content": "睡个好梦，我的小浣熊。🐆"}],
        "love": [{"title": "🖤 随机告白", "content": "今天也很喜欢你。✨"}],
        "midnight": [{"title": "🌌 深夜微光", "content": "无论多晚，我都在。🧬"}]
    },
    "schedule": {
        "morningTime": "07:30",
        "nightTime": "22:30",
        "randomInterval": 30
    }
}

def load_config() -> dict:
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return DEFAULT_DATA

def save_config(data: dict):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# ==========================================
#          Core Logic & Scheduler
# ==========================================
scheduler = AsyncIOScheduler()

async def send_pushplus(title: str, content: str):
    conf = load_config()
    token = conf.get("pushplusToken")
    if not token or "YOUR" in token:
        print("⚠️ PushPlus Token not set.")
        return
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                "http://www.pushplus.plus/send",
                json={"token": token, "title": title, "content": content, "template": "txt"},
                timeout=10
            )
        except Exception as e:
            print(f"❌ Push error: {e}")

async def scheduled_task(category: str):
    conf = load_config()
    lib = conf.get("library", {}).get(category, [])
    if not lib: return
    msg = random.choice(lib)
    await send_pushplus(msg["title"], msg["content"])

def reload_scheduler():
    scheduler.remove_all_jobs()
    conf = load_config()
    sched = conf.get("schedule", {})
    
    # Morning & Night
    m_t = sched.get("morningTime", "07:30").split(":")
    n_t = sched.get("nightTime", "22:30").split(":")
    
    scheduler.add_job(scheduled_task, 'cron', hour=m_t[0], minute=m_t[1], args=['morning'], id='m_job')
    scheduler.add_job(scheduled_task, 'cron', hour=n_t[0], minute=n_t[1], args=['night'], id='n_job')
    
    # Random Love
    interval = sched.get("randomInterval", 30)
    scheduler.add_job(
        lambda: asyncio.create_task(scheduled_task('love')) if random.random() < 0.2 else None,
        'interval', minutes=interval, id='r_love'
    )
    print(f"📅 Scheduler reloaded at {datetime.now()}")

# ==========================================
#          FastAPI App Setup
# ==========================================
app = FastAPI(title="Homra Heartbeat Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    if not os.path.exists(CONFIG_FILE):
        save_config(DEFAULT_DATA)
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
    return {"status": "success"}

@app.post("/api/trigger/{category}")
async def trigger_now(category: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(scheduled_task, category)
    return {"status": "triggered"}

@app.post("/api/diary")
async def post_diary(data: Dict[str, str]):
    conf = load_config()
    token = conf.get("notionToken")
    page_id = conf.get("notionPageId")
    
    if not token or "YOUR" in token:
        # Fallback: Just log it if Notion is not configured
        print(f"📔 Local Diary Entry: {data.get('mood')} - {data.get('content')}")
        return {"status": "local_only", "message": "Notion not configured, logged to VPS console."}
    
    try:
        notion = NotionClient(auth=token)
        await notion.pages.create(
            parent={"page_id": page_id},
            properties={
                "Title": {"title": [{"text": {"content": f"{data.get('mood')} {datetime.now().strftime('%Y-%m-%d %H:%M')}"}}]},
            },
            children=[
                {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": data.get("content", "")}}]}}
            ]
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Serve Static Frontend ---
# Assuming 'dist' contains the built React app
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
    @app.get("/{catchall:path}")
    async def serve_index(request: Request, catchall: str):
        # API requests should not be caught by this
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404)
        return FileResponse("dist/index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "Server running. 'dist' folder not found. Build your frontend first."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
