
import React, { useState } from 'react';
import { AppConfig, MessageLibrary, MessageTemplate } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface ConfigurationProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const Configuration: React.FC<ConfigurationProps> = ({ config, setConfig }) => {
  const [showSecrets, setShowSecrets] = useState(false);

  const updateToken = (key: keyof AppConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will remove all your private tokens from this browser's local storage (Good for privacy before sharing screens).")) {
      setConfig(DEFAULT_CONFIG);
    }
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
      newLib[category].push({ title: "New Message", content: "Message body..." });
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

  const SectionTitle = ({ title, icon }: { title: string, icon: string }) => (
    <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-purple-400">
      <i className={`fa-solid ${icon}`}></i>
      <span>{title}</span>
    </h3>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <div>
              <h2 className="font-bold text-white">Privacy Control</h2>
              <p className="text-[10px] text-zinc-500">Manage your sensitive credentials</p>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition-all flex items-center"
            >
                <i className={`fa-solid ${showSecrets ? 'fa-eye-slash' : 'fa-eye'} mr-2`}></i>
                {showSecrets ? 'Hide' : 'Show'} Tokens
            </button>
            <button 
                onClick={handleReset}
                className="text-xs bg-red-950/30 hover:bg-red-900/50 text-red-500 px-4 py-2 rounded-lg transition-all border border-red-900/20"
            >
                <i className="fa-solid fa-eraser mr-2"></i>
                Sanitize (Reset)
            </button>
          </div>
      </div>

      {/* API Keys */}
      <section>
        <SectionTitle title="Connection Settings" icon="fa-key" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">VPS Public IP</label>
            <input 
              value={config.vpsIp}
              onChange={(e) => updateToken('vpsIp', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none"
              placeholder="e.g. 1.2.3.4"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">PushPlus Token</label>
            <input 
              value={config.pushplusToken}
              type={showSecrets ? "text" : "password"}
              onChange={(e) => updateToken('pushplusToken', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none"
              placeholder="Your PushPlus token"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Notion API Token</label>
            <input 
              value={config.notionToken}
              type={showSecrets ? "text" : "password"}
              onChange={(e) => updateToken('notionToken', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none"
              placeholder="secret_..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 uppercase font-bold">Notion Page ID</label>
            <input 
              value={config.notionPageId}
              onChange={(e) => updateToken('notionPageId', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none"
              placeholder="305ee..."
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-zinc-500 uppercase font-bold">Notion Full URL (for easy access)</label>
            <input 
              value={config.notionLink}
              onChange={(e) => updateToken('notionLink', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none"
              placeholder="https://notion.so/..."
            />
          </div>
        </div>
      </section>

      {/* Message Library */}
      {(Object.keys(config.library) as Array<keyof MessageLibrary>).map((cat) => (
        <section key={cat} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
          <div className="flex justify-between items-center mb-4">
            <SectionTitle title={`${cat.charAt(0).toUpperCase() + cat.slice(1)} Messages`} icon="fa-message" />
            <button 
              onClick={() => addMessage(cat)}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md transition-all"
            >
              <i className="fa-solid fa-plus mr-1"></i> Add
            </button>
          </div>
          <div className="space-y-4">
            {config.library[cat].map((msg, idx) => (
              <div key={idx} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col gap-3 relative group">
                <button 
                  onClick={() => removeMessage(cat, idx)}
                  className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
                <input 
                  value={msg.title}
                  onChange={(e) => updateMessage(cat, idx, 'title', e.target.value)}
                  className="bg-transparent text-white font-bold text-sm outline-none border-b border-transparent focus:border-purple-500/50"
                  placeholder="Message Title"
                />
                <textarea 
                  value={msg.content}
                  onChange={(e) => updateMessage(cat, idx, 'content', e.target.value)}
                  className="bg-zinc-950/50 p-3 rounded-lg text-xs text-zinc-400 outline-none border border-zinc-800 focus:border-purple-500/50 min-h-[60px]"
                  placeholder="Aran's words..."
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Configuration;
