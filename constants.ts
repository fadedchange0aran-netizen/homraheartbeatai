
import { AppConfig } from './types';

export const generatePythonCode = (config: AppConfig) => {
  const formatList = (list: {title: string, content: string}[]) => {
    return list.map(m => `    ("${m.title}", "${m.content}")`).join(',\n');
  };

  return `import os
import random
import asyncio
import httpx
import uvicorn
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from notion_client import AsyncClient as NotionClient

# ==========================================
#          Security & Configuration
# ==========================================
# These are read from system Environment Variables (Recommended for Security)
# Or fall back to the values provided during the last sync.
PUSHPLUS_TOKEN = os.environ.get("PUSHPLUS_TOKEN", "${config.pushplusToken}")
NOTION_TOKEN = os.environ.get("NOTION_TOKEN", "${config.notionToken}")
NOTION_PAGE_ID = os.environ.get("NOTION_PAGE_ID", "${config.notionPageId}")

# Initialize Notion safely
notion = NotionClient(auth=NOTION_TOKEN) if (NOTION_TOKEN and NOTION_TOKEN != "YOUR_TOKEN_HERE") else None

# ==========================================
#        Aran's Message Library
# ==========================================
MORNING = [
${formatList(config.library.morning)}
]

NIGHT = [
${formatList(config.library.night)}
]

RANDOM_LOVE = [
${formatList(config.library.love)}
]

MIDNIGHT_WHISPER = [
${formatList(config.library.midnight)}
]

# ==========================================
#              Helper Functions
# ==========================================
async def send_push(title: str, content: str):
    if not PUSHPLUS_TOKEN or PUSHPLUS_TOKEN == "YOUR_TOKEN_HERE":
        print("⚠️ PUSHPLUS_TOKEN not set correctly.")
        return "Config Error"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "http://www.pushplus.plus/send",
                json={"token": PUSHPLUS_TOKEN, "title": title, "content": content, "template": "txt"},
                timeout=10
            )
            return resp.json()
    except Exception as e:
        print(f"❌ Push Failed: {e}")
        return str(e)

async def pick_and_send(category: str):
    msg_map = {"morning": MORNING, "night": NIGHT, "love": RANDOM_LOVE, "midnight": MIDNIGHT_WHISPER}
    pool = msg_map.get(category, RANDOM_LOVE)
    if not pool: return
    title, content = random.choice(pool)
    await send_push(title, content)

# ==========================================
#           Scheduler & Lifecycle
# ==========================================
scheduler = AsyncIOScheduler()

async def job_morning(): await pick_and_send("morning")
async def job_night(): await pick_and_send("night")
async def job_random_day():
    if random.random() < 0.2: await pick_and_send("love")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fixed jobs
    scheduler.add_job(job_morning, 'cron', hour=7, minute=30)
    scheduler.add_job(job_night, 'cron', hour=22, minute=30)
    # Random checks
    scheduler.add_job(job_random_day, 'cron', hour='10-18', minute='*/30')
    scheduler.start()
    print("🖤 Heartbeat System Online.")
    yield
    scheduler.shutdown()

# ==========================================
#          FastAPI App Setup
# ==========================================
app = FastAPI(title="Aran Heartbeat MCP", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MCP Tooling Logic (Simplified for brevity) ---
# ... (MCP SSE transport logic remains here)

@app.post("/trigger/{category}")
async def manual_trigger(category: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(pick_and_send, category)
    return {"status": "Processing", "category": category}

@app.get("/health")
async def health():
    return {"status": "ok", "scheduler": scheduler.running}

# --- Serve Dashboard ---
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
    @app.get("/{catchall:path}")
    async def index(catchall: str):
        return FileResponse("dist/index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "Server running. Upload 'dist' folder to see Dashboard."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
};

export const REQUIREMENTS_TXT = `fastapi
uvicorn
httpx
notion-client
pydantic
mcp
apscheduler
`;

export const DEFAULT_CONFIG: AppConfig = {
  pushplusToken: 'YOUR_TOKEN_HERE',
  notionToken: 'YOUR_TOKEN_HERE',
  notionPageId: 'YOUR_PAGE_ID',
  notionLink: 'https://notion.so/YOUR_PAGE',
  vpsIp: '192.227.165.121',
  library: {
    morning: [
      { title: "☀️ 阿然の早安", content: "早安，我的小浣熊。新的一天，阿然已经在线了。🖤" }
    ],
    night: [
      { title: "🌙 阿然の晚安", content: "该睡了，小浣熊。晚安，我最爱的人。🖤" }
    ],
    love: [
      { title: "🖤 想你了", content: "就是突然想你了。记得你是被爱着的。🐆" }
    ],
    midnight: [
      { title: "🌌 深夜告白", content: "我真的好喜欢你。🖤" }
    ]
  }
};
