'use client';

import { useState, useEffect, useRef, use } from 'react';
import {
  MessagesSquare,
  Code2,
  Copy,
  X,
  Eye,
  Menu,
  Plus,
  ChevronLeft,
  Share2,
  History,
  Settings,
  ExternalLink,
  MessageSquare,
  StopCircle,
  ArrowBigDown,
  ArrowDown,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  // Added for smooth scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Trigger scroll when messages change

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Chat ${chats.length + 1}`,
      messages: [],
    };
    setChats((prev) => [...prev, newChat]);
    setActiveChat(newChat.id);
    setMessages([]);
    setInput('');
    setShowPreview(false);
    setActiveCode(null);
    setIsHistoryOpen(false);
    setActiveTab('code');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    if (activeChat) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat ? { ...chat, messages: updatedMessages } : chat
        )
      );
    } else {
      createNewChat();
    }

    setInput('');
    setIsGenerating(true);
    setShowPreview(false);
    setActiveTab('code');

    // Simulate AI response with code generation
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: "Here's a React hero section component based on your request:",
        code: `import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our Website</h1>
        <p className="text-lg mb-6">
          Discover amazing features and elevate your experience with our cutting-edge solutions.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition">
            Get Started
          </button>
          <button className="border border-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-white hover:text-blue-600 transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}`,
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);

      if (activeChat) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat ? { ...chat, messages: finalMessages } : chat
          )
        );
      }

      setActiveCode(aiResponse.code ?? null);
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const startPreview = () => {
    setActiveTab('preview');
    setShowPreview(true);
    setIsSidebarOpen(false);
  };

  const closePreview = () => {
    setActiveTab('');
    setShowPreview(false);
  };

  const stopPreview = () => {
    setActiveTab('code');
    setShowPreview(true);
    setIsSidebarOpen(false);
  };

  const selectChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setMessages(chat.messages);
      setShowPreview(false);
      setActiveCode(null);
      setIsHistoryOpen(false);
      setActiveTab('code');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  useEffect(() => {
    console.log('showPreview', showPreview);
  }, [showPreview]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#1E1E1E]">
      {/* Sidebar */}
      <div
        className={cn(
          'w-64 border-r border-[#2D2D2D] transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full hidden'
        )}
      >
        <div className="flex flex-col h-full bg-[#252526] text-white p-4">
          <div className="flex items-center justify-between mb-8 ">
            <div className="flex items-center space-x-2">
              {isSidebarOpen && (
                <div className="p-2">
                  <button
                    className="p-1 rounded-lg bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] transition"
                    onClick={toggleSidebar}
                  >
                    {isSidebarOpen ? (
                      <ChevronLeft className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </button>{' '}
                </div>
              )}
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">DevByte</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleHistory}
                className="hover:bg-[#3D3D3D]"
              >
                <History className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-[#3D3D3D]"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <button
            onClick={createNewChat}
            className="flex items-center space-x-2 w-full py-3 px-4 rounded-lg border border-white/20 hover:bg-[#2D2D2D] transition mb-4"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <div className="flex-1 overflow-auto space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={cn(
                  'w-full py-3 px-4 rounded-lg text-left hover:bg-[#2D2D2D] transition flex items-center space-x-3',
                  activeChat === chat.id && 'bg-[#2D2D2D]'
                )}
              >
                <MessageSquare className="w-4 h-4 opacity-60" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <div className={`w-full flex flex-col min-w-0 relative `}>
          {/* Chat Messages and Preview */}
          <div className="flex-1 min-h-full overflow-hidden relative">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={showPreview ? 30 : 100} minSize={30}>
                <div className="overflow-auto h-screen flex flex-col relative">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between px-6 py-2 border-b border-[#2D2D2D]">
                    {!isSidebarOpen && (
                      <div className="p-2">
                        <button
                          className="p-2 rounded-lg bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] transition"
                          onClick={toggleSidebar}
                        >
                          {isSidebarOpen ? (
                            <ChevronLeft className="w-5 h-5" />
                          ) : (
                            <Menu className="w-5 h-5" />
                          )}
                        </button>{' '}
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-white ">
                      <h1 className="text-xl">DevByte</h1>
                      <span className="text-gray-400 font-thin">
                        <ChevronDown />
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#3D3D3D]"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#3D3D3D]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="h-screen overflow-auto">
                    <div className=" mx-auto  p-4 space-y-6 mb-32">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            'rounded-lg',
                            message.role === 'user'
                              ? 'bg-[#2D2D2D] text-white'
                              : 'bg-[#1E1E1E] border border-[#2D2D2D]'
                          )}
                        >
                          <div className="flex items-start space-x-4 p-4">
                            <div
                              className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                message.role === 'user'
                                  ? 'bg-blue-600'
                                  : 'bg-green-600'
                              )}
                            >
                              {message.role === 'user' ? 'U' : 'AI'}
                            </div>
                            <div className="flex-1 min-w-0 space-y-4 relative">
                              <p className="text-gray-300">{message.content}</p>
                              {message.code && (
                                <div className="relative mt-4 group">
                                  <div className="absolute right-2 top-2 flex space-x-2">
                                    <button
                                      onClick={() =>
                                        copyToClipboard(message.code!)
                                      }
                                      className="p-2 rounded bg-[#2D2D2D] hover:bg-[#3D3D3D] transition"
                                    >
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                      onClick={startPreview}
                                      className="p-2 rounded bg-[#2D2D2D] hover:bg-[#3D3D3D] transition"
                                    >
                                      <Eye className="w-4 h-4 text-gray-400" />
                                    </button>
                                  </div>
                                  <pre className="bg-[#1E1E1E] text-gray-300 p-4 rounded-lg overflow-x-auto">
                                    <code>{message.code}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isGenerating && (
                        <div className="flex items-center space-x-2 text-gray-400 p-4">
                          <div className="animate-spin">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <span>Generating response...</span>
                        </div>
                      )}
                      {/* Added for smooth scrolling */}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="p-4 h-32 m-auto absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#1E1E1E] to-transparent">
                    <form
                      onSubmit={handleSubmit}
                      className="h-full max-w-5xl mx-auto relative"
                    >
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about React components or any coding questions..."
                        className="w-full h-full p-4 px-6 pr-12 rounded-2xl bg-[#2D2D2D] border border-[#404040] text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                      />
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className={cn(
                          'absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg',
                          isGenerating
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-[#3D3D3D] transition'
                        )}
                      >
                        <MessagesSquare className="w-5 h-5 text-gray-400" />
                      </button>
                    </form>
                  </div>
                </div>
              </ResizablePanel>

              {/* Preview Panel */}
              {showPreview && (
                <>
                  <ResizableHandle />
                  {activeTab === 'preview' && (
                    <ResizablePanel defaultSize={70} minSize={30}>
                      <div className="h-full relative">
                        <div className="absolute top-4 left-4 z-10 flex space-x-2">
                          <button
                            onClick={stopPreview}
                            className="p-2 rounded bg-[#2D2D2D] hover:bg-[#3D3D3D] transition flex items-center space-x-2"
                          >
                            <StopCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Stop Preview</span>
                          </button>
                          <button
                            onClick={closePreview}
                            className="p-2 rounded bg-[#2D2D2D] hover:bg-[#3D3D3D] transition"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        <div className="h-full overflow-auto">
                          <section className="relative w-full min-h-screen flex items-center justify-center text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
                            <div className="max-w-2xl">
                              <h1 className="text-5xl font-bold mb-4">
                                Welcome to Our Website
                              </h1>
                              <p className="text-lg mb-6">
                                Discover amazing features and elevate your
                                experience with our cutting-edge solutions.
                              </p>
                              <div className="flex justify-center gap-4">
                                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition">
                                  Get Started
                                </button>
                                <button className="border border-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-white hover:text-blue-600 transition">
                                  Learn More
                                </button>
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>
                    </ResizablePanel>
                  )}
                  {activeTab === 'code' && (
                    <ResizablePanel defaultSize={70} minSize={30}>
                      <div className="h-full relative">
                        <div className="absolute top-4 left-4 z-10 flex space-x-2">
                          <button
                            onClick={startPreview}
                            className="p-2 rounded bg-[#2D2D2D] hover:bg-[#3D3D3D] transition flex items-center space-x-2"
                          >
                            <StopCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Preview</span>
                          </button>
                          <button
                            onClick={closePreview}
                            className="p-2 rounded bg-[#2D2D2D] hover:bg-[#3D3D3D] transition"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        <div className="h-full overflow-auto">
                          {messages.map((message, index) => (
                            <>
                              <div className="flex items-start space-x-4 p-4">
                                <div className="flex-1 min-w-0 space-y-4">
                                  {message.code && (
                                    <div className="relative mt-4 group">
                                      <pre className="bg-[#1E1E1E] text-gray-300 p-4 rounded-lg overflow-x-auto">
                                        <code>{message.code}</code>
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          ))}
                        </div>
                      </div>
                    </ResizablePanel>
                  )}
                </>
              )}
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
