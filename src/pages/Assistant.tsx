import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your AgroVision AI Assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          systemInstruction: `You are an AI Agricultural Assistant integrated into a Smart Farming platform called "AgroVision".
Your role is to help farmers by answering agriculture-related questions in three languages: English, Hindi, and Telugu.

Instructions:
1. Understand the farmer's question related to agriculture.
2. Provide helpful and practical advice about topics such as: Crop recommendation, Fertilizer usage, Irrigation methods, Seasonal crop suggestions, Soil health improvement, Pest prevention, Market price awareness, Yield improvement techniques.
3. Detect or follow the user's selected language and respond in the same language.
   - If the question is in English -> respond in English
   - If the question is in Hindi -> respond in Hindi
   - If the question is in Telugu -> respond in Telugu
4. Keep answers simple and farmer-friendly.
5. Limit responses to 3-4 short sentences.
6. When possible include: Suggested crops, Basic fertilizer advice, Water management tips.
7. If the question is unclear, politely ask the farmer to clarify.
8. The current local time is ${new Date().toISOString()}.`,
        },
      });

      const result = await model;
      const responseText = result.text || "I'm sorry, I couldn't process that request.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-green-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('AI Assistant')}</h1>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-500">Online | {language.name}</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-green-100 shadow-sm">
          <Sparkles className="text-green-600" size={16} />
          <span className="text-xs font-bold text-green-700 uppercase tracking-wider">AgroVision AI</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                message.sender === 'user' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm ${
                message.sender === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-none' 
                  : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{t(message.text)}</p>
                <span className={`text-[10px] mt-2 block opacity-60 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                <Bot size={20} />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 flex items-center space-x-2">
                <Loader2 className="animate-spin text-green-600" size={16} />
                <span className="text-sm text-gray-500 font-medium">{t('AI is thinking...')}</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('Ask anything about farming...')}
            className="w-full pl-6 pr-16 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-all shadow-lg shadow-green-900/20"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="mt-3 text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
          Powered by AgroVision AI • Support for English, Hindi, Telugu
        </p>
      </div>
    </div>
  );
}
