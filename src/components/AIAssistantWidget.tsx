'use client';

import React, { useState, useTransition } from 'react';
import { actionAskAITutor } from '@/lib/actions/ai-actions';
import { Bot, Send, Compass, Loader2, Terminal } from 'lucide-react';

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

export function AIAssistantWidget({ currentTaskTitle }: AIAssistantWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AI learning companion. I have full context of your 26-week curriculum roadmap, active topic ("${currentTaskTitle || 'Roadmap Focus'}"), and skill progress. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const suggestedPrompts = [
    'What should I study next today?',
    `Explain "${currentTaskTitle || 'this topic'}" simply.`,
    `Give me a practical exercise for ${currentTaskTitle || 'this skill'}.`,
    'Which topics need revision?',
    'Am I ready for the next topic?',
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
    <div className="bg-[#12161c] border border-[#252b34] rounded-xl flex flex-col h-[680px] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#252b34] bg-[#0d1015] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#171c23] border border-[#252b34] flex items-center justify-center text-[#f5f7fa] shadow-sm">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#f5f7fa] flex items-center gap-1.5">
              <span>AI Learning Companion</span>
            </h3>
            <p className="text-xs text-[#9aa3af] flex items-center gap-1">
              <span>Active Context:</span>
              <span className="text-[#f5f7fa] font-medium">{currentTaskTitle ? `"${currentTaskTitle}"` : 'Curriculum Roadmap'}</span>
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-md text-xs bg-[#171c23] text-[#9aa3af] border border-[#252b34] font-medium flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          Curriculum Aware
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#08090c]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                m.sender === 'user'
                  ? 'bg-[#171c23] text-[#f5f7fa] border border-[#374151] rounded-tr-none'
                  : m.isConfigured === false
                  ? 'bg-amber-950/40 text-amber-200 border border-amber-800/40 rounded-tl-none'
                  : 'bg-[#12161c] text-[#f5f7fa] border border-[#252b34] rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className="text-[10px] text-[#66707c] text-right pt-1 border-t border-[#252b34]">{m.time}</div>
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-[#12161c] p-3.5 rounded-xl border border-[#252b34] text-xs text-[#9aa3af] flex items-center space-x-2 shadow-sm">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Analyzing curriculum state & generating response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-[#0d1015] border-t border-[#252b34] overflow-x-auto flex items-center space-x-2 shrink-0">
        <span className="text-xs text-[#9aa3af] font-medium shrink-0 flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-[#66707c]" />
          Quick Prompts:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            disabled={isPending}
            className="whitespace-nowrap px-3 py-1 bg-[#12161c] hover:bg-[#171c23] border border-[#252b34] hover:border-[#374151] rounded-lg text-xs text-[#9aa3af] hover:text-[#f5f7fa] transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3.5 border-t border-[#252b34] bg-[#0d1015] flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask your learning companion anything about your current topic..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#12161c] border border-[#252b34] rounded-lg px-4 py-2.5 text-xs text-[#f5f7fa] focus:outline-none focus:border-[#374151] placeholder:text-[#66707c]"
        />

        <button
          onClick={() => handleSend()}
          disabled={isPending || !input.trim()}
          className="px-5 py-2.5 bg-[#f5f7fa] hover:bg-white text-[#08090c] text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}


