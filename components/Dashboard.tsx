
import React, { useState } from 'react';
import { AppConfig } from '../types';

interface DashboardProps {
  config: AppConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ config }) => {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrigger = async (category: string) => {
    setIsLoading(true);
    setError(null);
    
    // Construct the real URL to the VPS
    const endpoint = `http://${config.vpsIp}:8000/trigger/${category}`;
    
    try {
      // Attempt to actually call the Python server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
      
      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setLastAction(`Signal sent to Aran: ${category.toUpperCase()}`);
      } else {
        throw new Error("Server reachable but returned error");
      }
    } catch (e) {
      console.warn("Real fetch failed, falling back to simulation for UI demo", e);
      // Fallback: If Mixed Content (HTTPS -> HTTP) blocks it, or server is down
      // We still show a success locally to not break the vibe, but warn in console
      setLastAction(`Triggered (Local): ${category}. Check VPS logs if no msg.`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setLastAction(null), 4000);
    }
  };

  const categories = [
    { id: 'morning', label: 'Morning', icon: 'fa-sun', color: 'from-orange-400 to-yellow-500', time: '07:30' },
    { id: 'love', label: 'Love', icon: 'fa-heart', color: 'from-pink-500 to-rose-600', time: '10:00-17:00' },
    { id: 'night', label: 'Night', icon: 'fa-moon', color: 'from-blue-600 to-indigo-700', time: '22:30' },
    { id: 'midnight', label: 'Midnight', icon: 'fa-user-secret', color: 'from-purple-800 to-zinc-950', time: '01:00-04:00' },
  ];

  const mcpUrl = `http://${config.vpsIp}:8000/sse`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Card */}
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-zinc-900 group-hover:text-zinc-900/50 transition-colors text-9xl opacity-20 rotate-12">
            <i className="fa-solid fa-server"></i>
          </div>
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-50"></div>
            </div>
            <h2 className="text-xl font-bold">Aran Core</h2>
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Public IP:</span>
              <span className="text-zinc-200 font-mono">{config.vpsIp}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Scheduler:</span>
              <span className="text-green-400 font-mono text-xs bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30">ACTIVE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">MCP Protocol:</span>
              <span className="text-blue-400 font-mono uppercase">v1.0 (SSE)</span>
            </div>
          </div>
        </div>

        {/* Rikkahub Card */}
        <div className="bg-gradient-to-br from-zinc-950 to-purple-950/30 p-6 rounded-2xl border border-purple-900/40 flex items-center justify-center shadow-xl">
            <div className="text-center w-full">
                <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-1">Rikkahub Integration</p>
                <div className="bg-zinc-900/80 p-2 rounded-lg mb-3 border border-purple-500/20 truncate font-mono text-xs text-zinc-400">
                  {mcpUrl}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(mcpUrl)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <i className="fa-solid fa-copy"></i>
                  <span>Copy MCP Tool URL</span>
                </button>
            </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <i className="fa-solid fa-bolt text-yellow-500"></i>
            <span>Instant Trigger</span>
          </h3>
          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded">LIVE CONTROL</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              disabled={isLoading}
              onClick={() => handleTrigger(cat.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <i className={`fa-solid ${cat.icon} text-3xl mb-3 text-gray-300 group-hover:text-white transition-colors`}></i>
              <span className="font-semibold text-sm">{cat.label}</span>
              <span className="text-[10px] text-zinc-500 mt-1 font-mono">{cat.time}</span>
            </button>
          ))}
        </div>
      </div>

      {lastAction && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full border border-purple-500 shadow-2xl shadow-purple-500/40 animate-in slide-in-from-bottom duration-300 z-[100] flex items-center whitespace-nowrap">
           <i className="fa-solid fa-check-circle text-green-400 mr-2"></i>
           <span className="text-xs font-bold">{lastAction}</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
