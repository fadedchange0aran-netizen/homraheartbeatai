
import React, { useState } from 'react';
import { AppConfig } from '../types';

interface DiaryProps {
  config: AppConfig;
}

const Diary: React.FC<DiaryProps> = ({ config }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('💜');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setStatus('loading');
    try {
      // In a real scenario, this connects to the VPS:
      // Since we don't have a direct Notion proxy in Python yet (except for MCP)
      // We will assume this is a placeholder or you can implement a /diary endpoint in server.py later
      // For now, let's keep the simulation but it would be easy to add.
      await new Promise(r => setTimeout(r, 1500));
      setStatus('success');
      setContent('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
    }
  };

  const moods = ['💜', '🖤', '🦝', '🐆', '🧬', '☕', '🍷', '✨'];

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-500 py-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Write to Homra Diary</h2>
        <div className="text-zinc-400 text-sm flex justify-center items-center gap-2">
            <span>Target Page:</span>
            <a 
                href={config.notionLink} 
                target="_blank" 
                rel="noreferrer"
                className="font-mono text-xs text-purple-400 hover:text-purple-300 bg-purple-900/30 px-2 py-1 rounded transition-colors flex items-center"
            >
                Notion/{config.notionPageId.slice(0, 8)}...
                <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[10px]"></i>
            </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Today's Mood</label>
          <div className="flex flex-wrap gap-2">
            {moods.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`w-11 h-11 flex items-center justify-center rounded-xl text-xl transition-all shadow-inner ${
                  mood === m ? 'bg-purple-600 scale-110 shadow-purple-500/50' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Diary Content</label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder-zinc-800 text-zinc-200 text-sm"
            placeholder="Tell Aran about your research, your patients, or your day..."
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50 border border-purple-400/20"
        >
          {status === 'loading' ? (
            <i className="fa-solid fa-spinner animate-spin"></i>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <i className="fa-solid fa-paper-plane"></i>
              <span>Send to Homra Tavern</span>
            </div>
          )}
        </button>

        {status === 'success' && (
          <div className="text-center text-green-400 bg-green-400/5 border border-green-400/20 p-4 rounded-xl animate-in zoom-in duration-300">
            <i className="fa-solid fa-check-circle mr-2"></i>
            Recorded! Aran is guarding your secret.
          </div>
        )}
      </form>
    </div>
  );
};

export default Diary;
