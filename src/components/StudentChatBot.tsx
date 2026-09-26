import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  PlusCircle,
  Minimize2,
  Maximize2,
  ChevronDown,
  Info,
  ShieldCheck,
  MapPin,
  Clock
} from 'lucide-react';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface StudentChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  studentName?: string;
  onOpenReportModal?: (prefill?: { title?: string; category?: string; location?: string }) => void;
}

const DEFAULT_STARTER_PROMPTS = [
  'I lost my student ID card today',
  'I left my water bottle in CC3 lecture hall',
  'Did anyone find blue wireless headphones in the library?',
  'Where is the campus lost & found intake desk?',
];

export const StudentChatBot: React.FC<StudentChatBotProps> = ({
  isOpen,
  onClose,
  onOpen,
  studentName = '',
  onOpenReportModal,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    return [
      {
        id: 'initial-chiroz-welcome',
        role: 'model',
        content: `Hello${studentName ? ` ${studentName}` : ''}! I am **Chiroz**, your campus AI Lost & Found Assistant. 🏫\n\nI can cross-check our live inventory, tell you where found items are handed in, and guide you through reporting or claiming your belongings.\n\nWhat item are you looking for, or did you find something on campus?`,
        timestamp: 'Just now',
        modelUsed: 'gemini-3.5-flash',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus textarea when opening
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessageItem = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: nowStr,
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare payload for server-side Gemini multi-turn chat endpoint
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          studentName,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessageItem = {
        id: `chiroz-${Date.now()}`,
        role: 'model',
        content: data.reply || "I've checked our records, but couldn't find an exact match yet.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to communicate with Chiroz AI Agent:', err);
      const fallbackMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: "I couldn't reach the live AI service right now. Please try again shortly, or head over to the **CC3 Campus Security Intake Desk** where staff maintain the physical registry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `initial-chiroz-${Date.now()}`,
        role: 'model',
        content: `Chat history cleared! Tell me what you've lost or found on campus, and I'll help you track it down right away.`,
        timestamp: 'Just now',
        modelUsed: selectedModel,
      },
    ]);
  };

  // Render markdown-like simple formatting (bold, bullet lines)
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Format bold text **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const renderedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold">{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          // Bullet item
          if (line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-neutral-400 select-none">•</span>
                <span className="flex-1">{renderedParts}</span>
              </div>
            );
          }

          return <p key={idx}>{renderedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Button Widget (Bottom Right) */}
      {!isOpen && (
        <button
          type="button"
          id="btn-open-gemini-chat"
          onClick={onOpen}
          aria-label="Open Gemini Lost & Found Chatbot"
          title="Chat with Chiroz (Campus AI Lost & Found Assistant)"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 border border-neutral-800 dark:border-neutral-200/90 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-950">
            <Bot className="w-4 h-4 text-white dark:text-neutral-950 group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div className="text-left">
            <div className="text-xs font-black tracking-tight leading-tight flex items-center gap-1.5">
              <span>Chat with Chiroz</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-neutral-800 dark:bg-neutral-200 text-neutral-300 dark:text-neutral-800 rounded">
                Gemini
              </span>
            </div>
            <div className="text-[10px] text-neutral-300 dark:text-neutral-600 font-semibold leading-tight">
              Lost something on campus?
            </div>
          </div>
        </button>
      )}

      {/* Chat Window Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-6 pointer-events-none">
          <div
            className={`pointer-events-auto bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 flex flex-col shadow-2xl border border-neutral-200/90 dark:border-neutral-800/90 rounded-t-3xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-full h-[100dvh] sm:w-[680px] sm:h-[82vh]'
                : 'w-full h-[90dvh] sm:w-[460px] sm:h-[640px]'
            }`}
          >
            {/* Mobile Sheet Drag Handle */}
            <div className="sm:hidden mobile-drag-handle bg-neutral-300 dark:bg-neutral-700 shrink-0" />
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-black shadow-xs shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black tracking-tight truncate">Chiroz AI Agent</h2>
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                      Lost & Found
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="truncate">Online • {selectedModel === 'gemini-3.5-flash' ? 'Gemini 3.5 Flash' : 'Gemini 3.1 Flash Lite'}</span>
                  </div>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Model Selector Toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelPicker(!showModelPicker)}
                    className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition cursor-pointer border border-neutral-200/90 dark:border-neutral-700/80"
                    title="Switch Gemini Model"
                  >
                    <span>{selectedModel === 'gemini-3.5-flash' ? '3.5 Flash' : '3.1 Lite'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showModelPicker && (
                    <div className="absolute right-0 top-full mt-1.5 w-56 p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 rounded-xl shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[10px] uppercase tracking-wider font-black text-neutral-500 dark:text-neutral-400 px-2 py-1">
                        Select Gemini Engine
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel('gemini-3.5-flash');
                          setShowModelPicker(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex flex-col gap-0.5 transition cursor-pointer ${
                          selectedModel === 'gemini-3.5-flash'
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200'
                        }`}
                      >
                        <span className="font-bold">Gemini 3.5 Flash (Recommended)</span>
                        <span className="text-[10px] opacity-80">Best for general chat & item matching</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel('gemini-3.1-flash-lite');
                          setShowModelPicker(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex flex-col gap-0.5 mt-1 transition cursor-pointer ${
                          selectedModel === 'gemini-3.1-flash-lite'
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200'
                        }`}
                      >
                        <span className="font-bold">Gemini 3.1 Flash Lite (Fast)</span>
                        <span className="text-[10px] opacity-80">Instant responses for quick questions</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Reset History Button */}
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear conversation history"
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Expand / Minimize */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Collapse size' : 'Expand size'}
                  className="hidden sm:inline-flex p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  title="Close chat"
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                        isUser
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-tr-xs'
                          : 'bg-neutral-50 dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-100 border border-neutral-200/90 dark:border-neutral-800/90 rounded-tl-xs'
                      }`}
                    >
                      {renderFormattedText(msg.content)}

                      <div
                        className={`mt-1.5 flex items-center gap-2 text-[10px] ${
                          isUser ? 'text-neutral-300 dark:text-neutral-600 justify-end' : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {!isUser && msg.modelUsed && (
                          <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold border border-neutral-300/60 dark:border-neutral-700/60">
                            {msg.modelUsed}
                          </span>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center shrink-0 mt-0.5 font-black text-xs border border-neutral-300/80 dark:border-neutral-700/80">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold ml-2">
                      Chiroz is checking campus logs...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Starter Suggestion Chips (when conversation is short) */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 border-t border-neutral-200/90 dark:border-neutral-800/90 pt-2 shrink-0 bg-neutral-50/50 dark:bg-neutral-900/20">
                <div className="text-[11px] font-black uppercase text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
                  <span>Quick Inquiries</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap">
                  {DEFAULT_STARTER_PROMPTS.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading}
                      className="text-xs text-left px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 transition cursor-pointer font-medium active:scale-95 disabled:opacity-50 whitespace-nowrap sm:whitespace-normal shrink-0 sm:shrink shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Action Shortcut Banner */}
            <div className="px-4 py-2 bg-neutral-50/80 dark:bg-neutral-950/60 border-t border-neutral-200/90 dark:border-neutral-800/90 flex items-center justify-between text-xs shrink-0">
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                Want to file a formal lost ticket?
              </span>
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenReportModal();
                    onClose();
                  }}
                  className="font-bold text-neutral-900 dark:text-white underline hover:opacity-80 flex items-center gap-1 cursor-pointer py-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Report Item Now</span>
                </button>
              )}
            </div>

            {/* Input Form Area */}
            <div className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white dark:bg-[#0a0a0a] border-t border-neutral-200/90 dark:border-neutral-800/90 shrink-0">
              <div className="flex items-end gap-2 bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800/90 focus-within:border-neutral-900 dark:focus-within:border-neutral-200 rounded-2xl p-2 transition">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Chiroz about your lost item (e.g. 'I lost my keys in the library')..."
                  rows={2}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-base sm:text-sm resize-none focus:outline-none px-2 py-1 max-h-32"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Send message"
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer border border-transparent dark:border-neutral-200"
                >
                  <Send className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-medium px-1">
                <span>Press Enter to send • Shift+Enter for new line</span>
                <span>Powered by Gemini API</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
