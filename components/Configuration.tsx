
import React, { useState, useEffect } from 'react';
import { AppConfig, MessageLibrary, MessageTemplate } from '../types';

interface ConfigurationProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const Configuration: React.FC<ConfigurationProps> = ({ config, setConfig }) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Relative API paths ensure it works regardless of IP/Domain
  const API_BASE = window.location.hostname === 'localhost' ? `http://${window.location.hostname}:8000` : '';

  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(res => res.json())
      .then(data => {
        if (data.pushplusToken) setConfig(data);
      })
      .catch(() => console.log("Running in standalone mode or server offline."));
  }, []);

  const saveToVPS = async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${API_BASE}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else throw new Error();
    } catch (e) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const updateToken = (key: keyof AppConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateSchedule = (key: keyof AppConfig['schedule'], value: string | number) => {
    setConfig(prev => ({ 
        ...prev, 
        schedule: { ...prev.schedule, [key]: value } 
    }));
  };

  const updateMessage = (category: keyof MessageLibrary, index: number, field: keyof MessageTemplate, value: string) => {
    setConfig(prev => {
      const newLib = { ...prev.library };
      newLib[category][index][field] = value;
      return { ...prev, library: newLib };
    });
  };

  const addMessage = (category: keyof MessageLibrary) => {
    setConfig(prev => {
      const newLib = { ...prev.library };
      newLib[category].push({ title: "New Title", content: "New Content" });
      return { ...prev, library: newLib };
    });
  };

  const removeMessage = (category: keyof MessageLibrary, index: number) => {
    setConfig(prev => {
      const newLib = { ...prev.library };
      newLib[category].splice(index, 1);
      return { ...prev, library: newLib };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="sticky top-20 z-[60] flex justify-end">
        <button 
          onClick={saveToVPS}
          disabled={syncStatus === 'syncing'}
          className={`px-6 py-3 rounded-full font-bold text-white shadow-xl transition-all flex items-center gap-2 ${
            syncStatus === 'success' ? 'bg-green-600' : 
            syncStatus === 'error' ? 'bg-red-600' : 'bg-purple-600 hover:bg-purple-500 scale-105 active:scale-95'
          }`}
        >
          <i className={`fa-solid ${
            syncStatus === 'syncing' ? 'fa-spinner animate-spin' : 
            syncStatus === 'success' ? 'fa-check' : 'fa-cloud-arrow-up'
          }`}></i>
          {syncStatus === 'syncing' ? 'Syncing...' : 
           syncStatus === 'success' ? 'Saved to VPS' : 
           syncStatus === 'error' ? 'Sync Failed' : 'Push to VPS'}
        </button>
      </div>

      <section className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
        <h3 className="text-lg font-bold mb-4 text-purple-400 flex items-center gap-2">
            <i className="fa-solid fa-key"></i> API Credentials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">PushPlus Token</label>
            <input value={config.pushplusToken} onChange={(e) => updateToken('pushplusToken', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Notion Token</label>
            <input type="password" value={config.notionToken} onChange={(e) => updateToken('notionToken', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Notion Page ID</label>
            <input value={config.notionPageId} onChange={(e) => updateToken('notionPageId', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Server Public IP (UI Display Only)</label>
            <input value={config.vpsIp} onChange={(e) => updateToken('vpsIp', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none" />
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
        <h3 className="text-lg font-bold mb-4 text-orange-400 flex items-center gap-2">
            <i className="fa-solid fa-clock"></i> Scheduling
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Morning (HH:mm)</label>
            <input type="time" value={config.schedule.morningTime} onChange={(e) => updateSchedule('morningTime', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Night (HH:mm)</label>
            <input type="time" value={config.schedule.nightTime} onChange={(e) => updateSchedule('nightTime', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Random Interval (Mins)</label>
            <input type="number" value={config.schedule.randomInterval} onChange={(e) => updateSchedule('randomInterval', parseInt(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none" />
          </div>
        </div>
      </section>

      {(Object.keys(config.library) as Array<keyof MessageLibrary>).map((cat) => (
        <section key={cat} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-zinc-300 capitalize">{cat} Library</h3>
            <button onClick={() => addMessage(cat)} className="text-xs bg-purple-600/20 text-purple-400 border border-purple-500/20 px-3 py-1 rounded hover:bg-purple-600/30 transition-colors">Add</button>
          </div>
          <div className="space-y-4">
            {config.library[cat].map((msg, idx) => (
              <div key={idx} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 relative group">
                <button onClick={() => removeMessage(cat, idx)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-trash-can"></i>
                </button>
                <input value={msg.title} onChange={(e) => updateMessage(cat, idx, 'title', e.target.value)} className="w-full bg-transparent font-bold text-sm border-b border-transparent focus:border-purple-500 outline-none mb-2" />
                <textarea value={msg.content} onChange={(e) => updateMessage(cat, idx, 'content', e.target.value)} className="w-full bg-transparent text-xs text-zinc-400 outline-none min-h-[40px] resize-none" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Configuration;
