
import React, { useState } from 'react';
import { generatePythonCode, REQUIREMENTS_TXT } from '../constants';
import { AppConfig } from '../types';

interface BackendCodeProps {
  config: AppConfig;
}

const BackendCode: React.FC<BackendCodeProps> = ({ config }) => {
  const [copied, setCopied] = useState<'server' | 'req' | 'sync' | null>(null);
  const fullCode = generatePythonCode(config);

  const copyToClipboard = (text: string, type: 'server' | 'req' | 'sync') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Special command for easy VPS updating
  const updateCmd = `echo '${fullCode.replace(/'/g, "'\\''")}' > server.py && pkill -f server.py || true && nohup python3 server.py > heartbeat.log 2>&1 &`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deploy & Sync</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Publish to GitHub or host everything on your RackNerd VPS.
          </p>
        </div>
        <div className="bg-purple-600/10 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] text-purple-400 font-bold flex items-center">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping mr-2"></span>
            ALL-IN-ONE READY
        </div>
      </div>

      {/* Deployment Strategies */}
      <div className="grid grid-cols-1 gap-4">
        {/* 1. GitHub */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center">
                <i className="fa-brands fa-github mr-2 text-xl"></i> 1. Publish Source to GitHub
            </h3>
            <p className="text-[10px] text-zinc-500 mb-4">Save your code version history.</p>
            <div className="space-y-2">
                <div className="bg-zinc-900 p-3 rounded font-mono text-[10px] text-purple-400 border border-zinc-800 select-all">
                    git init<br/>
                    git add .<br/>
                    git commit -m "Initial commit"<br/>
                    git branch -M main<br/>
                    git remote add origin https://github.com/YOUR_USERNAME/homra-heartbeat.git<br/>
                    git push -u origin main
                </div>
            </div>
        </div>

        {/* 2. Full VPS Hosting */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 rounded-2xl border border-blue-900/30">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center">
                <i className="fa-solid fa-server mr-2 text-xl text-blue-500"></i> 2. Host EVERYTHING on VPS
            </h3>
            <p className="text-[10px] text-zinc-400 mb-4">
              This method runs both the <b>React Dashboard</b> and the <b>Python Server</b> on your VPS port 8000.
            </p>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase">Step A: Build Frontend</span>
                <div className="mt-1 bg-zinc-950 p-2 rounded font-mono text-[10px] text-gray-300 border border-zinc-800">
                  npm run build
                </div>
                <p className="text-[9px] text-zinc-500 mt-1">This creates a 'dist' folder.</p>
              </div>

              <div>
                <span className="text-xs font-bold text-blue-400 uppercase">Step B: Upload to VPS</span>
                <div className="mt-1 bg-zinc-950 p-2 rounded font-mono text-[10px] text-gray-300 border border-zinc-800">
                  scp -r dist root@{config.vpsIp}:/root/
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-blue-400 uppercase">Step C: Update Server Code</span>
                <p className="text-[9px] text-zinc-500 mb-1">Copy the command below and run it on your VPS.</p>
                <button 
                    onClick={() => copyToClipboard(updateCmd, 'sync')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded transition-all"
                >
                    {copied === 'sync' ? 'COPIED SYNC COMMAND' : 'COPY UPDATE COMMAND'}
                </button>
              </div>

              <div className="mt-2 text-[10px] text-green-400">
                <i className="fa-solid fa-check mr-1"></i>
                After this, access your dashboard at: <b>http://{config.vpsIp}:8000/</b>
              </div>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Requirements */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Environment Setup</h3>
            <button 
              onClick={() => copyToClipboard(REQUIREMENTS_TXT, 'req')}
              className="text-xs text-purple-400 hover:underline"
            >
              {copied === 'req' ? 'Copied!' : 'Copy requirements.txt'}
            </button>
          </div>
          <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-[10px] overflow-x-auto text-green-500">
            {REQUIREMENTS_TXT}
          </pre>
        </div>

        {/* Server Script Preview */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">server.py Preview</h3>
            <button 
              onClick={() => copyToClipboard(fullCode, 'server')}
              className="px-4 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] rounded-lg font-bold transition-all shadow-lg shadow-purple-500/20"
            >
              {copied === 'server' ? 'COPIED!' : 'COPY CODE'}
            </button>
          </div>
          <div className="h-[200px] bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[11px] overflow-y-auto p-4 custom-scrollbar shadow-inner">
            <pre className="text-blue-400/90 whitespace-pre">
              {fullCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendCode;
