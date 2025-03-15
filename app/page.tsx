'use client';
import { useState, useEffect, useRef } from 'react';
import './styles.scss';
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
  ChevronDown,
  FileIcon,
} from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';

const classNames = (...classes: (string | boolean)[] ) => {
  return classes.filter(Boolean).join(' ');
};

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
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePreviewMode, setMobilePreviewMode] = useState(false);
  const [previewMessageIndex, setPreviewMessageIndex] = useState<number | null>(null);

  // Added for smooth scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setActiveTab('');
    
    // Auto close sidebar on mobile after creation
    if (isMobile) {
      setIsSidebarOpen(false);
    }
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
    setActiveTab('');

    // Simulate AI response with code generation
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: "Here's a React hero section component based on your request:",
        code: `import React from 'react';
export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Welcome to Our Website</h1>
        <p className="hero-description">
          Discover amazing features and elevate your experience with our cutting-edge solutions.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary">
            Get Started
          </button>
          <button className="btn btn-secondary">
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

  const startPreview = (messageIndex: number) => {
    setActiveTab('preview');
    setShowPreview(true);
    setPreviewMessageIndex(messageIndex);
    
    // Set mobile preview mode if on mobile
    if (isMobile) {
      setMobilePreviewMode(true);
      setIsSidebarOpen(false);
    }
  };

  const stopPreview = () => {
    setActiveTab('code');
    setShowPreview(true);
    
    // Keep mobile preview mode active since we're still showing preview content
    if (isMobile) {
      setMobilePreviewMode(true);
      setIsSidebarOpen(false);
    }
  };

  const closePreview = () => {
    setActiveTab('');
    setShowPreview(false);
    setMobilePreviewMode(false);
    setPreviewMessageIndex(null);
  };

  const selectChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setMessages(chat.messages);
      setShowPreview(false);
      setActiveCode(null);
      setIsHistoryOpen(false);
      setActiveTab('');
      
      // Auto close sidebar on mobile after selection
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log('toggleSidebar', isSidebarOpen);
    
  };

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  // Update the useEffect for screen size detection
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      // Check if we need to adjust the preview mode for mobile
      if (isMobileView && showPreview) {
        setMobilePreviewMode(true);
      } else {
        setMobilePreviewMode(false);
      }
    };
    
    // Set initial values
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [showPreview]);

  return (
    <div className="app-container">
      {/* Sidebar with proper classes */}
      <div
        className={classNames(
          'sidebar',
          isSidebarOpen ? 'sidebar--open' : 'sidebar--closed',
          isMobile ? 'sidebar--mobile' : 'sidebar--desktop'
        )}
      >
        <div className="sidebar__inner">
          <div className="sidebar__header">
            <div className="sidebar__logo">
              <div className="sidebar-toggle-wrapper">
                <button
                  className="sidebar-toggle"
                  onClick={toggleSidebar}
                >
                  {isSidebarOpen ? (
                    <ChevronLeft className="icon" />
                  ) : (
                    <Menu className="icon" />
                  )}
                </button>
              </div>
              <MessageSquare className="icon" />
              <span className="sidebar__title">DevByte</span>
            </div>
            <div className="sidebar__actions">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleHistory}
                className="sidebar__action-btn"
              >
                <History className="icon-sm" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="sidebar__action-btn"
              >
                <Settings className="icon-sm" />
              </Button>
            </div>
          </div>
          <button
            onClick={createNewChat}
            className="new-chat-btn"
          >
            <Plus className="icon-sm" />
            <span>New Chat</span>
          </button>
          <div className="chat-list">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={classNames(
                  'chat-item',
                  activeChat === chat.id && 'chat-item--active'
                )}
              >
                <MessageSquare className="icon-sm icon-muted" />
                <span className="chat-item__title">{chat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile backdrop - only show on mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="mobile-backdrop active" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Content - add class based on sidebar state */}
      <div className={classNames(
        'main-content',
        isSidebarOpen && !isMobile ? 'main-content--with-sidebar' : ''
      )}>
        <div className="main-content__inner">
          {/* Chat Messages and Preview */}
          <div className="content-wrapper">
            <ResizablePanelGroup direction="horizontal">
              {/* Only show chat panel if not in mobile preview mode */}
              {(!mobilePreviewMode || !isMobile) && (
                <ResizablePanel 
                  defaultSize={showPreview && !isMobile ? 50 : 100} 
                  minSize={30}
                >
                  <div className="chat-panel">
                    {/* Top Bar */}
                    <div className="top-bar">
                      {(!isSidebarOpen || isMobile) && (
                        <div className="sidebar-toggle-wrapper">
                          <button
                            className="sidebar-toggle"
                            onClick={toggleSidebar}
                          >
                            <Menu className="icon" />
                          </button>
                        </div>
                      )}
                      <div className="app-title">
                        <h1 className="app-title__text">DevByte</h1>
                        <span className="app-title__icon">
                          <ChevronDown />
                        </span>
                      </div>
                      <div className="top-bar__actions">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="top-bar__action-btn"
                        >
                          <Share2 className="icon-sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="top-bar__action-btn"
                        >
                          <ExternalLink className="icon-sm" />
                        </Button>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="messages-container">
                      <div className="messages-wrapper">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={classNames(
                              'message',
                              message.role === 'user'
                                ? 'message--user'
                                : 'message--assistant'
                            )}
                          >
                            <div className="message__content">
                              <div
                                className={classNames(
                                  'message__avatar',
                                  message.role === 'user'
                                    ? 'message__avatar--user'
                                    : 'message__avatar--assistant'
                                )}
                              >
                                {message.role === 'user' ? 'U' : 'AI'}
                              </div>
                              <div className="message__body">
                                <p className="message__text">{message.content}</p>
                                {message.code && (
                                  <div className="code-block">
                                    <div className="code-block__actions">
                                      <button
                                        onClick={() =>
                                          copyToClipboard(message.code!)
                                        }
                                        className="code-block__action-btn"
                                      >
                                        <Copy className="icon-sm icon-muted" />
                                      </button>
                                      <button
                                        onClick={() => startPreview(index)}
                                        className="code-block__action-btn"
                                      >
                                        <Eye className="icon-sm icon-muted" />
                                      </button>
                                    </div>
                                    <pre className="code-block__content">
                                      <code>{message.code}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isGenerating && (
                          <div className="generating-indicator">
                            <div className="generating-indicator__spinner">
                              <Code2 className="icon-sm" />
                            </div>
                            <span>Generating response...</span>
                          </div>
                        )}
                        {/* Added for smooth scrolling */}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="input-area">
                      <form
                        onSubmit={handleSubmit}
                        className="input-form"
                      >
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask about React components or any coding questions..."
                          className="input-field"
                        />
                        <button
                          type="submit"
                          disabled={isGenerating}
                          className={classNames(
                            'submit-btn',
                            isGenerating && 'submit-btn--disabled'
                          )}
                        >
                          <MessagesSquare className="icon-sm icon-muted" />
                        </button>
                      </form>
                    </div>
                  </div>
                </ResizablePanel>
              )}

              {/* Preview Panel - take full width on mobile */}
              {showPreview && (
                <>
                  {!mobilePreviewMode && <ResizableHandle withHandle className="resize-handle" />}
                  <ResizablePanel defaultSize={mobilePreviewMode ? 100 : 50} minSize={30}>
                    <div className={classNames(
                      activeTab === 'preview' ? "preview-panel" : "code-panel",
                      mobilePreviewMode && "mobile-preview-mode"
                    )}>
                      <div className={activeTab === 'preview' ? "preview-panel__actions" : "code-panel__actions"}>
                        {/* Add back button for mobile */}
                        {isMobile && (
                          <button onClick={closePreview} className="preview-back-btn">
                            <ChevronLeft className="icon-sm" />
                            <span>Back to chat</span>
                          </button>
                        )}
                        
                        {/* Existing preview/code panel actions */}
                        {activeTab === 'preview' ? (
                          <>
                            <button onClick={stopPreview} className="preview-action-btn">
                              <StopCircle className="icon-sm icon-muted" />
                              <span className="preview-action-btn__text">Stop Preview</span>
                            </button>
                            <button onClick={closePreview} className="preview-action-btn">
                              <X className="icon-sm icon-muted" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startPreview(previewMessageIndex!)} className="code-action-btn">
                              <Eye className="icon-sm icon-muted" />
                              <span className="code-action-btn__text">Preview</span>
                            </button>
                            <button onClick={closePreview} className="code-action-btn">
                              <X className="icon-sm icon-muted" />
                            </button>
                          </>
                        )}
                        
                      </div>
                      
                      {activeTab === 'preview' && previewMessageIndex !== null && (
                        <div className="preview-content">
                          <section className="hero-section">
                            <div className="hero-content">
                              <h1 className="hero-title">Welcome to Our Website</h1>
                              <p className="hero-description">
                                Discover amazing features and elevate your experience with our cutting-edge solutions.
                              </p>
                              <div className="hero-buttons">
                                <button className="btn btn-primary">Get Started</button>
                                <button className="btn btn-secondary">Learn More</button>
                              </div>
                            </div>
                          </section>
                        </div>
                      )}
                      
                      {activeTab === 'code' && previewMessageIndex !== null && (
                        <div className="code-panel__content">
                          
                          {previewMessageIndex !== null && messages[previewMessageIndex].code && (
                            <div 
                              className="code-block" 
                              data-line-numbers={Array.from(
                                { length: messages[previewMessageIndex].code!.split('\n').length },
                                (_, i) => i + 1
                              ).join('\n')}
                            >
                              <pre>
                                <code className="language-typescript">
                                  {messages[previewMessageIndex].code!.split('\n').map((line, lineIndex) => (
                                    <div key={lineIndex} className={lineIndex === 6 ? "code-line-highlight" : ""}>
                                      {line}
                                    </div>
                                  ))}
                                </code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </div>
  );
}