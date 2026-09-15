'use client';

import React, { useState, useTransition } from 'react';
import { actionAskAITutor } from '@/lib/actions/ai-actions';
import { Bot, Send, Sparkles, AlertCircle, Loader2, MessageSquare, Terminal } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  isConfigured?: boolean;
}

interface AIAssistantWidgetProps {
  currentTaskTitle?: string;
  currentMonthName?: string;
}

export function AIAssistantWidget({ currentTaskTitle, currentMonthName }: AIAssistantWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AI Automation Developer Senior Tutor. I have full context of your 26-week curriculum roadmap, active topic ("${currentTaskTitle || 'Roadmap Focus'}"), and verified skill progress. How can I assist your engineering study today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const suggestedPrompts = [
    'What should I study next today?',
    `Explain "${currentTaskTitle || 'this topic'}" simply.`,
    `Give me a practical exercise for ${currentTaskTitle || 'this skill'}.`,
    'Which topics are weak and need revision?',
    'Am I ready to move to the next topic?',
  ];

  const handleSend = (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    startTransition(async () => {
      const res = await actionAskAITutor(promptText);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isConfigured: res.isConfigured,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    });
  };

  return (
    <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl flex flex-col h-[680px] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-[#080d19] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>AI Learning Senior Tutor</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span>Active Context:</span>
              <span className="text-cyan-300 font-semibold">{currentTaskTitle ? `"${currentTaskTitle}"` : 'Roadmap Curriculum'}</span>
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Roadmap-Aware
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#090e1b]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed space-y-2 font-mono shadow-md ${
                m.sender === 'user'
                  ? 'bg-cyan-950/90 text-cyan-100 border border-cyan-700/80 rounded-tr-none'
                  : m.isConfigured === false
                  ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 rounded-tl-none'
                  : 'bg-[#0e1420] text-slate-200 border border-slate-800/90 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className="text-[10px] text-slate-400 text-right font-mono pt-1 border-t border-white/5">{m.time}</div>
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-[#0e1420] p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 flex items-center space-x-2 shadow-md">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Analyzing curriculum state & generating senior tutor response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 bg-[#080d19] border-t border-slate-800/80 overflow-x-auto flex items-center space-x-2 shrink-0">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Terminal className="w-3 h-3 text-cyan-400" />
          Quick Prompts:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            disabled={isPending}
            className="whitespace-nowrap px-3 py-1 bg-[#0e1420] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-[11px] font-mono text-slate-300 transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#080d19] flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask your senior tutor anything about your current topic or codebase..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#0e1420] border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
        />

        <button
          onClick={() => handleSend()}
          disabled={isPending || !input.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg transition shadow-md shadow-cyan-950 flex items-center gap-1.5 shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

