'use client';

import React, { useState, useTransition } from 'react';
import { actionAskAITutor } from '@/lib/actions/ai-actions';

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
      text: `Hello! I am your AI Automation Developer Senior Tutor. I have full context of your 26-week roadmap, current task ("${currentTaskTitle || 'Roadmap Focus'}"), and recent progress. How can I help you master your curriculum today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const suggestedPrompts = [
    'What should I study today?',
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
    <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-[650px] shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-900 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-950">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">AI Learning Assistant & Tutor</h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Context: {currentTaskTitle ? `"${currentTaskTitle}"` : 'Active Curriculum'}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
          Roadmap-Aware
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed space-y-2 font-mono ${
                m.sender === 'user'
                  ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-800'
                  : m.isConfigured === false
                  ? 'bg-amber-950/60 text-amber-200 border border-amber-800'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className="text-[10px] text-slate-500 text-right font-mono">{m.time}</div>
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Analyzing your roadmap state & generating tutor explanation...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-900 overflow-x-auto flex space-x-2">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            disabled={isPending}
            className="whitespace-nowrap px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-900 bg-slate-950 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask your senior tutor anything about your current topic or codebase..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
        />

        <button
          onClick={() => handleSend()}
          disabled={isPending || !input.trim()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs rounded-lg transition shadow-md shadow-cyan-950"
        >
          Send
        </button>
      </div>
    </div>
  );
}
