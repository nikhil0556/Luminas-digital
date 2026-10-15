import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  Search,
  ExternalLink,
  RotateCcw,
  User,
  Zap,
  Brain,
  ShieldCheck,
  Flame,
  BookOpen,
  Download,
  Key,
  CreditCard,
  Briefcase,
  HelpCircle,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export type AgentRole = 'concierge' | 'prompt_architect' | 'business_strategist' | 'speed_support';
export type GeminiModelType = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  sources?: { title: string; url: string }[];
  grounded?: boolean;
  model?: string;
  role?: AgentRole;
  agentName?: string;
}

interface RoleConfig {
  id: AgentRole;
  title: string;
  shortLabel: string;
  icon: any;
  defaultModel: GeminiModelType;
  modelLabel: string;
  description: string;
  welcomeText: string;
  suggestions: { text: string; icon: any }[];
}

const AGENT_ROLES: Record<AgentRole, RoleConfig> = {
  concierge: {
    id: 'concierge',
    title: 'Store Concierge & Product Guide',
    shortLabel: 'Concierge',
    icon: Sparkles,
    defaultModel: 'gemini-3.5-flash',
    modelLabel: 'Gemini 3.5 Flash (General Tasks)',
    description: 'General product recommendations, pricing in INR/USD, Razorpay checkout, and digital access.',
    welcomeText: "Hi there! I'm **Lumina Agent**, your AI Customer Concierge.\n\nI can help you explore our digital products, recommend the best e-books and prompt packs, explain our Razorpay payment checkout, or guide you through your downloads.\n\nWhat can I help you find today?",
    suggestions: [
      { text: "Recommend a prompt pack", icon: Sparkles },
      { text: "What's in the 100 Trending ChatGPT Prompts?", icon: Flame },
      { text: "How do the Prompt PDF Books work?", icon: BookOpen },
      { text: "How do I download my purchases?", icon: Download },
      { text: "What payment methods are supported?", icon: CreditCard }
    ]
  },
  prompt_architect: {
    id: 'prompt_architect',
    title: 'AI Prompt Architect & Engineer',
    shortLabel: 'Prompt Architect',
    icon: Brain,
    defaultModel: 'gemini-3.1-pro-preview',
    modelLabel: 'Gemini 3.1 Pro (Complex Reasoning)',
    description: 'Deep reasoning model for crafting structured prompts, system instructions, and custom templates.',
    welcomeText: "Greetings! I'm **Lumina Agent** in **Prompt Architect Mode** powered by **Gemini 3.1 Pro**.\n\nI specialize in advanced prompt engineering, custom slash command design, system prompts, and multi-step AI reasoning workflows.\n\nTell me what goal, role, or project you'd like me to build a prompt for!",
    suggestions: [
      { text: "Draft a viral LinkedIn content prompt", icon: Sparkles },
      { text: "Create an AI coding & code-review prompt", icon: Key },
      { text: "Build a Midjourney cinematic portrait prompt", icon: BookOpen },
      { text: "Explain prompt variable placeholders", icon: Brain }
    ]
  },
  business_strategist: {
    id: 'business_strategist',
    title: 'Creator & Business Strategist',
    shortLabel: 'Business Coach',
    icon: Briefcase,
    defaultModel: 'gemini-3.1-pro-preview',
    modelLabel: 'Gemini 3.1 Pro (Complex Strategy)',
    description: 'High-level guidance on digital product creation, freelance client OS, and monetization.',
    welcomeText: "Welcome! I'm **Lumina Agent** in **Business Strategist Mode**.\n\nI help creators, freelancers, and entrepreneurs plan digital products, price offerings, implement the **Freelance Notion OS**, and build scalable digital income systems.\n\nWhat business challenge are you tackling?",
    suggestions: [
      { text: "How do I price my first digital product?", icon: Briefcase },
      { text: "Explain the Notion Freelancer OS workflow", icon: Layers },
      { text: "How can I acquire high-ticket freelance clients?", icon: Sparkles },
      { text: "What are the passive income chapters in the Playbook?", icon: BookOpen }
    ]
  },
  speed_support: {
    id: 'speed_support',
    title: 'Instant Support & Rapid FAQ',
    shortLabel: 'Speed FAQ',
    icon: Zap,
    defaultModel: 'gemini-3.1-flash-lite',
    modelLabel: 'Gemini 3.1 Flash-Lite (Fast Tasks)',
    description: 'Ultra-fast low-latency replies for coupons, licenses, file types, and instant policies.',
    welcomeText: "⚡ Instant Support Ready! I'm **Lumina Agent** in **Speed Support Mode** powered by **Gemini 3.1 Flash-Lite**.\n\nAsk me any fast question about active coupon codes, refunds, licenses, or download access for instant answers.",
    suggestions: [
      { text: "How do I contact customer care?", icon: HelpCircle },
      { text: "What is the 20% discount coupon code?", icon: Zap },
      { text: "What is your refund policy?", icon: ShieldCheck },
      { text: "Do I get commercial rights?", icon: Key },
      { text: "What formats do the downloads come in?", icon: Download }
    ]
  }
};

export const CustomerChatbot: React.FC = () => {
  const { user, saveCustomerEnquiry, fetchCustomerEnquiries, saveChatSession, fetchChatSession } = useAuth();
  const { setActivePage } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<AgentRole>('concierge');
  const [activeModel, setActiveModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [showSettings, setShowSettings] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      agentName: 'Lumina Agent',
      role: 'concierge',
      model: 'gemini-3.5-flash',
      text: AGENT_ROLES.concierge.welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentThinkingStep, setCurrentThinkingStep] = useState<string>('');
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isThinking]);

  // Load chat session from Firestore when user signs in
  useEffect(() => {
    if (user) {
      fetchChatSession(`session_${user.uid}`).then((session) => {
        if (session && session.messages && session.messages.length > 0) {
          setMessages(session.messages);
        } else {
          fetchCustomerEnquiries().then((pastEnquiries) => {
            if (pastEnquiries && pastEnquiries.length > 0) {
              const formatted: ChatMessage[] = pastEnquiries.map(item => ({
                id: item.id,
                sender: item.sender,
                agentName: item.sender === 'agent' ? 'Lumina Agent' : undefined,
                text: item.message,
                timestamp: item.timestamp
              }));
              setMessages(prev => {
                const existingIds = new Set(formatted.map(f => f.id));
                const filteredPrev = prev.filter(p => p.id === 'welcome-msg' || !existingIds.has(p.id));
                return [...filteredPrev, ...formatted];
              });
            }
          });
        }
      });
    }
  }, [user]);

  // Handle switching role
  const handleRoleChange = (role: AgentRole) => {
    setActiveRole(role);
    const targetModel = AGENT_ROLES[role].defaultModel;
    setActiveModel(targetModel);
    
    // Add a polite system transition notice in the thread
    const noticeMsg: ChatMessage = {
      id: `role-switch-${Date.now()}`,
      sender: 'agent',
      agentName: 'Lumina Agent',
      role,
      model: targetModel,
      text: `🔄 Switched to **${AGENT_ROLES[role].title}** mode (${AGENT_ROLES[role].modelLabel}).\n\n${AGENT_ROLES[role].description}\n\nHow can I assist you in this role?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, noticeMsg]);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isThinking) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsThinking(true);

    // Save user message to Firestore if authenticated
    if (user) {
      saveCustomerEnquiry({
        id: userMessageId,
        message: textToSend,
        sender: 'user',
        timestamp: userMsg.timestamp
      }).catch(err => console.warn('Enquiry save notice:', err));
    }

    // Dynamic thinking steps tailored to the active role
    const thinkingStepsMap: Record<AgentRole, string[]> = {
      concierge: [
        'Lumina Agent analyzing customer inquiry...',
        'Scanning store catalog & INR pricing thresholds...',
        'Running Google Search grounding for fresh information...',
        'Formatting recommendations & checkout guides...'
      ],
      prompt_architect: [
        'Lumina Agent initializing Gemini 3.1 Pro reasoning engine...',
        'Parsing prompt requirements & domain parameters...',
        'Synthesizing variable brackets & output formats...',
        'Structuring battle-tested master prompt...'
      ],
      business_strategist: [
        'Lumina Agent evaluating business context...',
        'Benchmarking digital product & monetization models...',
        'Aligning strategies with Notion Freelance OS...',
        'Generating actionable advisory steps...'
      ],
      speed_support: [
        'Lumina Agent querying instant knowledge base...',
        'Retrieving policy & coupon information...',
        'Delivering instant response via Gemini 3.1 Flash-Lite...'
      ]
    };

    const steps = thinkingStepsMap[activeRole];
    let stepIndex = 0;
    setCurrentThinkingStep(steps[0]);
    const thinkingInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setCurrentThinkingStep(steps[stepIndex]);
      }
    }, 400);

    try {
      // Build conversation history for the multi-turn session
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          role: activeRole,
          model: activeModel
        })
      });

      clearInterval(thinkingInterval);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const agentMsgId = `agent-${Date.now()}`;
      const agentReply: ChatMessage = {
        id: agentMsgId,
        sender: 'agent',
        agentName: data.agentName || 'Lumina Agent',
        role: (data.role as AgentRole) || activeRole,
        text: data.reply || "I'm right here to help! Could you please clarify your question?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        grounded: !!data.grounded,
        model: data.model || activeModel
      };

      setMessages(prev => {
        const updated = [...prev, agentReply];
        if (user) {
          saveChatSession(`session_${user.uid}`, updated).catch(() => {});
        }
        return updated;
      });

      if (!isOpen) {
        setHasNewMessage(true);
      }

      // Save agent response to Firestore if authenticated
      if (user) {
        saveCustomerEnquiry({
          id: agentMsgId,
          message: agentReply.text,
          sender: 'agent',
          timestamp: agentReply.timestamp
        }).catch(err => console.warn('Enquiry agent save notice:', err));
      }
    } catch (error) {
      clearInterval(thinkingInterval);
      console.error('Chat error:', error);
      const fallbackMsg: ChatMessage = {
        id: `agent-err-${Date.now()}`,
        sender: 'agent',
        agentName: 'Lumina Agent',
        role: activeRole,
        model: activeModel,
        text: "I'm right here to assist you! All our prompt packs include lifetime access and commercial rights. You can also explore our **100 Trending ChatGPT '/' Prompts** or **Prompt PDF Books Vault** directly in the top menu.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
      setCurrentThinkingStep('');
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'agent',
        agentName: 'Lumina Agent',
        role: activeRole,
        model: activeModel,
        text: `Fresh multi-turn session initialized with **Lumina Agent** in **${AGENT_ROLES[activeRole].title}** mode.\n\nWhat can I help you accomplish or find?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const currentRoleConfig = AGENT_ROLES[activeRole];

  return (
    <>
      {/* Floating Trigger Button */}
      <div id="customer-chatbot-trigger" className="fixed bottom-6 right-6 z-40">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(prev => !prev)}
          className="relative group flex items-center gap-2.5 clay-btn btn-shine-sweep !rounded-full text-white px-5 py-3 cursor-pointer"
          aria-label="Open Lumina Agent"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-neutral-950 animate-pulse" />
          </div>
          <span className="text-sm font-semibold tracking-wide">
            {isOpen ? 'Close Lumina Agent' : 'Lumina Agent'}
          </span>

          {hasNewMessage && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="customer-chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 340 }}
            className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[640px] h-[86vh] glass-strong rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100"
          >
            {/* Header: Identity & Controls */}
            <div className="p-3.5 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                  <Bot className="w-5 h-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-neutral-900" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm text-white flex items-center gap-1">
                      <span>Lumina Agent</span>
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Live AI Agent
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                    {currentRoleConfig.shortLabel} • {activeModel.replace('gemini-', 'Gemini ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSettings(prev => !prev)}
                  title="Agent Roles & Model Selection"
                  className={`p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer ${showSettings ? 'bg-neutral-800 text-indigo-400' : 'hover:bg-neutral-800'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Restart Multi-turn Thread"
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role & Model Settings Drawer (Collapsible) */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-neutral-800 bg-neutral-950/80 px-3.5 py-2.5 text-xs space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold mb-1.5">
                      <span>CHOOSE AGENT ROLE</span>
                      <span className="text-[10px] text-indigo-400">Multi-Role Specialized Intelligence</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(AGENT_ROLES) as AgentRole[]).map((rKey) => {
                        const roleObj = AGENT_ROLES[rKey];
                        const Icon = roleObj.icon;
                        const isSelected = activeRole === rKey;
                        return (
                          <button
                            key={rKey}
                            type="button"
                            onClick={() => handleRoleChange(rKey)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-sm'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-neutral-500'}`} />
                            <span className="truncate text-[11px]">{roleObj.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold mb-1">
                      <span>GEMINI MODEL ROUTING</span>
                      <span className="text-[10px] text-cyan-400">Google Gemini GenAI SDK</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveModel('gemini-3.5-flash')}
                        className={`px-2 py-1 rounded text-[10px] border transition-all text-center cursor-pointer ${
                          activeModel === 'gemini-3.5-flash'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        ⚡ 3.5 Flash
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModel('gemini-3.1-flash-lite')}
                        className={`px-2 py-1 rounded text-[10px] border transition-all text-center cursor-pointer ${
                          activeModel === 'gemini-3.1-flash-lite'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        🚀 3.1 Lite (Fast)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModel('gemini-3.1-pro-preview')}
                        className={`px-2 py-1 rounded text-[10px] border transition-all text-center cursor-pointer ${
                          activeModel === 'gemini-3.1-pro-preview'
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        🧠 3.1 Pro (Complex)
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Role Pill Ribbon */}
            <div className="px-3 py-1.5 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 shrink-0">Role:</span>
              {(Object.keys(AGENT_ROLES) as AgentRole[]).map((rKey) => {
                const roleObj = AGENT_ROLES[rKey];
                const Icon = roleObj.icon;
                const isSelected = activeRole === rKey;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => handleRoleChange(rKey)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500 text-white font-semibold shadow-sm'
                        : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{roleObj.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Status & Search Grounding Bar */}
            <div className="px-3.5 py-1 bg-indigo-950/30 border-b border-indigo-900/20 flex items-center justify-between text-[10px] text-indigo-300">
              <span className="flex items-center gap-1">
                <Search className="w-2.5 h-2.5 text-cyan-400" />
                <span>Google Search Grounded • Multi-Turn Active</span>
              </span>
              {user ? (
                <span className="text-emerald-300 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Cloud Synced
                </span>
              ) : (
                <span className="text-neutral-500">Guest Session</span>
              )}
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm scrollbar-thin">
              {messages.map((msg) => {
                const isAgent = msg.sender === 'agent';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAgent && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-300 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-1`}>
                      {isAgent && (
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 px-1">
                          <span className="font-bold text-white">Lumina Agent</span>
                          {msg.model && (
                            <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-cyan-300 border border-neutral-700/60 font-mono text-[9px]">
                              {msg.model.replace('gemini-', '')}
                            </span>
                          )}
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap text-[13px] ${
                          isAgent
                            ? 'bg-neutral-800/90 text-neutral-200 border border-neutral-700/50 rounded-tl-sm'
                            : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Google Search Grounding Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <Search className="w-2.5 h-2.5 text-cyan-400" />
                            Grounded via Google Search:
                          </span>
                          {msg.sources.slice(0, 3).map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] bg-neutral-800 text-cyan-300 hover:text-white px-2 py-0.5 rounded-full border border-neutral-700 transition-colors"
                            >
                              <span>{source.title.length > 24 ? source.title.slice(0, 24) + '...' : source.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}

                      <span className={`block text-[10px] text-neutral-500 px-1 ${isAgent ? 'text-left' : 'text-right'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {!isAgent && (
                      <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 text-neutral-300 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Dynamic Thinking Indicator */}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 justify-start"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-300 mt-0.5">
                    <Brain className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3 bg-neutral-800/80 border border-neutral-700/50 rounded-2xl rounded-tl-sm text-neutral-300 space-y-2 max-w-[85%]">
                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      <span>{currentThinkingStep || 'Lumina Agent is processing...'}</span>
                    </div>
                    <div className="w-full bg-neutral-700/50 h-1 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 w-1/2"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Role-Specific Suggested Enquiry Chips */}
            {messages.length < 5 && !isThinking && (
              <div className="px-3.5 py-2 border-t border-neutral-800/60 bg-neutral-950/40">
                <p className="text-[10px] text-neutral-400 mb-1.5 font-medium flex items-center justify-between">
                  <span>Suggested for {currentRoleConfig.shortLabel}:</span>
                  <span className="font-mono text-indigo-400 text-[9px]">{activeModel.replace('gemini-', '')}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentRoleConfig.suggestions.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(item.text)}
                        className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-2.5 py-1 rounded-lg border border-neutral-700/60 transition-all flex items-center gap-1.5 text-left cursor-pointer"
                      >
                        <Icon className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="text-[11px]">{item.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-neutral-800 bg-neutral-900/90 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask Lumina Agent (${currentRoleConfig.shortLabel})...`}
                disabled={isThinking}
                className="flex-1 neu-inset rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 transition-all disabled:opacity-60"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.94 }}
                disabled={!inputMessage.trim() || isThinking}
                className="p-2.5 rounded-xl clay-btn btn-shine-sweep text-white font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer shrink-0"
                aria-label="Send message to Lumina Agent"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
