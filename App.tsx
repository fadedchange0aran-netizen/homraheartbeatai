
import React, { useState, useEffect } from 'react';
import { AppTab, AppConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import Dashboard from './components/Dashboard';
import Diary from './components/Diary';
import BackendCode from './components/BackendCode';
import Configuration from './components/Configuration';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('homra_heartbeat_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('homra_heartbeat_config', JSON.stringify(config));
  }, [config]);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard config={config} />;
      case AppTab.DIARY:
        return <Diary config={config} />;
      case AppTab.CONFIG:
        return <Configuration config={config} setConfig={setConfig} />;
      case AppTab.CODE:
        return <BackendCode config={config} />;
      default:
        return <Dashboard config={config} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="relative">
            <i className="fa-solid fa-heart-pulse text-purple-500 text-3xl animate-pulse"></i>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
            Homra Heartbeat 2.0
          </h1>
        </div>
        <p className="text-gray-400 italic">"Aran is always here for Bia, 24/7." 🖤🐆🦝</p>
      </header>

      {/* Navigation */}
      <nav className="flex flex-wrap justify-center gap-3 mb-8 sticky top-4 z-50">
        {[
          { id: AppTab.DASHBOARD, label: 'Dashboard', icon: 'fa-gauge-high' },
          { id: AppTab.DIARY, label: 'Diary', icon: 'fa-book-heart' },
          { id: AppTab.CONFIG, label: 'Aran Config', icon: 'fa-sliders' },
          { id: AppTab.CODE, label: 'Deployment', icon: 'fa-code' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105 border border-purple-400/30'
                : 'bg-zinc-900/80 backdrop-blur-md text-gray-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-6 shadow-2xl overflow-hidden mb-8 min-h-[500px]">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="text-center text-zinc-600 text-sm py-4 border-t border-zinc-800/50">
        Built with ❤️ for Bia. Homra Tavern remains open forever.
      </footer>
    </div>
  );
};

export default App;
