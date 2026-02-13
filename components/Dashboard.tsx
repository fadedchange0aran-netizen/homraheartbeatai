
import React, { useState } from 'react';
import { AppConfig } from '../types';

interface DashboardProps {
  config: AppConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ config }) => {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const API_BASE = window.location.hostname === 'localhost' ? `http://${window.location.hostname}:8000` : '';

  const handleTrigger = async (category: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/trigger/${category}`, { method: 'POST' });
      if (response.ok) {
        setLastAction(`Signal sent to Aran: ${category.toUpperCase()}`);
      }
    } catch (e) {
      setLastAction(`Error connecting to server. Check IP: ${config.vpsIp}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setLastAction(null), 4000);
    }
  };

  const categories = [
    { id: 'morning', label: 'Morning', icon: 'fa-sun', color: 'from-orange-400 to-yellow-500', time: config.schedule.morningTime },
    { id: 'love', label: 'Love', icon: 'fa-heart', color: 'from-pink-500 to-rose-600', time: 'Random' },
    { id: 'night', label: 'Night', icon: 'fa-moon', color: 'from-blue-600 to-indigo-700', time: config.schedule.nightTime },
    { id: 'midnight', label: 'Midnight', icon: 'fa-user-secret', color: 'from-purple-800 to-zinc-950', time: 'Manual' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-zinc-900 group-hover:text-zinc-900/50 transition-colors text-9xl opacity-20 rotate-12">
            <i className="fa-solid fa-server"></i>
          </div>
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-50"></div>
            </div>
            <h2 className="text-xl font-bold">Aran Status</h2>
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Public Entry:</span>
              <span className="text-zinc-200 font-mono">{config.vpsIp || '127.0.0.1'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Scheduler:</span>
              <span className="text-green-400 font-mono text-xs bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-950 to-purple-950/30 p-6 rounded-2xl border border-purple-900/40 flex items-center justify-center shadow-xl">
            <div className="text-center w-full">
                <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-1">Rikkahub SSE Entry</p>
                <div className="bg-zinc-900/80 p-2 rounded-lg mb-3 border border-purple-500/20 truncate font-mono text-xs text-zinc-400 select-all">
                  http://{config.vpsIp || 'YOUR_IP'}:8000/sse
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(`http://${config.vpsIp}:8000/sse`)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/20"
                >
                  <i className="fa-solid fa-copy"></i>
                  <span>Copy Link</span>
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
          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded">DIRECT VPS SIGNAL</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              disabled={isLoading}
              onClick={() => handleTrigger(cat.id)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full border border-purple-500 shadow-2xl shadow-purple-500/40 animate-in slide-in-from-bottom duration-300 z-[100] flex items-center">
           <i className="fa-solid fa-check-circle text-green-400 mr-2"></i>
           <span className="text-xs font-bold">{lastAction}</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
