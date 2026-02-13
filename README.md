
# 🖤 Homra Heartbeat 2.0 (Universal Repository)

这是一个全栈个人助手系统，集成了：
- **Python 后端**: 管理 API、持久化配置、动态定时任务。
- **React 仪表盘**: 远程更新配置、手动触发推送、记录日记。

## 🚀 快速开始

### 1. 克隆并运行 (VPS 端)
```bash
git clone https://github.com/YOUR_USER/homra-heartbeat.git
cd homra-heartbeat

# 安装依赖
pip install -r requirements.txt

# 启动服务
python server.py
```

### 2. 配置与部署
- 默认端口为 `8000`。
- 首次运行会自动创建 `config.json`。
- 访问 `http://YOUR_IP:8000/` 即可进入管理后台。

### 3. 如何在前端修改后即时生效？
1. 在 **Aran Config** 标签页修改参数（如把早安时间改为 06:00）。
2. 点击右上角的 **"Sync to Server"** 按钮。
3. 后端会自动保存配置并重载定时器，无需重启。

## 🛠️ 技术细节
- **Persistence**: 所有的修改都保存在服务器本地的 `config.json`。
- **Auto-Sync**: 前端加载时会自动尝试同步服务器最新的配置。
- **Dynamic Scheduler**: 使用 APScheduler 实现不重启重载任务。
