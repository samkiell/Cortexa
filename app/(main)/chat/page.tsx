'use client';

import { motion } from 'framer-motion';
import { Bot, MessageSquarePlus, Sparkles } from 'lucide-react';
import ModelSelector from '@/components/chat/ModelSelector';
import { useState } from 'react';

export default function NewChatPage() {
  const [selectedModel, setSelectedModel] = useState('huihui-ai/Llama-3.3-70B-Instruct-abliterated');

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      {/* Header Area with Model Selector */}
      <div className="absolute top-0 w-full flex items-center justify-between h-16 px-6 border-b border-border-custom bg-base/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="font-syne font-bold text-white tracking-tight">New Conversation</span>
        </div>
        <ModelSelector 
          currentModel={selectedModel} 
          onSelect={(modelId) => setSelectedModel(modelId)} 
        />
      </div>

      {/* Main Empty State Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="h-20 w-20 rounded-3xl bg-accent flex items-center justify-center shadow-2xl shadow-accent/20 mx-auto">
            <Bot className="h-10 w-10 text-white" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent/40 blur-md"
          />
        </div>

        <div className="space-y-4">
          <h1 className="font-syne text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            How can I help you today?
          </h1>
          <p className="text-lg text-muted max-w-lg mx-auto leading-relaxed">
            Select a model from the list above and start a new conversation. Use vision-capable models to chat with images.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {[
            { 
              icon: MessageSquarePlus, 
              title: "Creative Writing", 
              desc: "Write a short story about a neon-noir city." 
            },
            { 
              icon: Sparkles, 
              title: "Code Assistant", 
              desc: "Help me optimize this Go function." 
            }
          ].map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, backgroundColor: '#1e1e1e' }}
              whileTap={{ scale: 0.98 }}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border-custom bg-surface p-6 text-left transition-all hover:border-accent/50"
            >
              <item.icon className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-syne font-bold text-white">{item.title}</h3>
                <p className="text-sm text-muted group-hover:text-text-custom transition-colors">{item.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
