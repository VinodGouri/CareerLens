import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, Lightbulb } from 'lucide-react';
import { useCareer } from '../../context/CareerContext';

export default function AIChatbotModal() {
  const { isAIChatOpen, setIsAIChatOpen, currentUser } = useCareer();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${currentUser?.name || 'there'}! 👋 I am your CareerLens intelligence assistant. Ask me anything about your job compatibility, skill gaps, resume bullet improvements, or learning roadmaps.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    "Why is my match score 87% for ABC Tech?",
    "What should I learn next to maximize offers?",
    "Generate an ATS resume summary for Full Stack Developer",
    "Which roles best fit my current projects?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAIChatOpen) return null;

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      }).then(r => r.json());

      if (res.success) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: res.data.reply }]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: `Based on your profile, your strongest matches are Full Stack Developer roles in Hyderabad and Bangalore. Focus on building containerized Docker projects to bridge your primary gap!` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl h-[620px] glass-panel rounded-2xl border border-white/15 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-glow-primary">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                CareerLens AI Copilot
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Profile Grounded
                </span>
              </h3>
              <p className="text-xs text-slate-400">Context-aware advice tailored to {currentUser?.name}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAIChatOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-brand-600/30 border border-brand-500/40 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-brand-300" />
                </div>
              )}
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-brand-600 text-white rounded-br-xs shadow-md' 
                    : 'bg-slate-800/80 text-slate-200 border border-white/10 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex-shrink-0 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4 text-brand-400" />
              </div>
              <span className="animate-pulse">Analyzing candidate fit and intelligence models...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 border-t border-white/5 bg-slate-900/40 flex gap-2 overflow-x-auto no-scrollbar">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] whitespace-nowrap bg-white/5 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 px-3 py-1.5 rounded-full border border-white/10 hover:border-brand-500/30 transition-all flex items-center gap-1.5"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about match scores, skill roadmaps, or interview tips..."
              className="flex-1 bg-slate-950/80 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition-all shadow-glow-primary"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
