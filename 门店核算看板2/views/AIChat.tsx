import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    ArrowLeft,
    ArrowRight,
    AudioLines,
    Bot,
    Check,
    ChevronDown,
    ChevronUp,
    Copy,
    Keyboard,
    Mic,
    Moon,
    RefreshCw,
    Send,
    Sparkles,
    Square,
    Sun,
    Trash2,
    User
} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {streamChatCompletion} from '../services/aiService';
import {useTheme} from '../contexts/ThemeContext';
import type * as EChartsNamespace from 'echarts';

// Loading Dots Animation Component
const LoadingDots: React.FC<{ isDark?: boolean }> = ({isDark = true}) => (
    <span className="inline-flex items-center ml-2">
    <svg width="24" height="8" viewBox="0 0 24 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="4" r="3" fill="currentColor" className={isDark ? 'text-cyan-400' : 'text-blue-500'}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0s"/>
      </circle>
      <circle cx="12" cy="4" r="3" fill="currentColor" className={isDark ? 'text-cyan-400' : 'text-blue-500'}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.33s"/>
      </circle>
      <circle cx="20" cy="4" r="3" fill="currentColor" className={isDark ? 'text-cyan-400' : 'text-blue-500'}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.66s"/>
      </circle>
    </svg>
  </span>
);

// ECharts Renderer Component
interface EChartsRendererProps {
    code: string;
    isGenerating: boolean;
    isDark: boolean;
}

const EChartsRenderer: React.FC<EChartsRendererProps> = React.memo(({code, isGenerating, isDark}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<EChartsNamespace.ECharts | null>(null);
    const pendingConfigRef = useRef<string>('');
    const [echartsLib, setEchartsLib] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Dynamic import echarts
    useEffect(() => {
        import('echarts').then((mod) => {
            setEchartsLib(mod);
            setIsLoading(false);
        });
    }, []);

    const defaultTextStyle = {
        color: isDark ? '#fff' : '#1E293B'
    };

    const mergeDefaultConfig = (config: any) => {
        return {
            ...config,
            textStyle: {...defaultTextStyle, ...config.textStyle},
            title: config.title ? {
                ...config.title,
                textStyle: {...defaultTextStyle, ...config.title?.textStyle}
            } : undefined,
            legend: config.legend ? {
                ...config.legend,
                textStyle: {...defaultTextStyle, ...config.legend?.textStyle}
            } : undefined,
            xAxis: config.xAxis ? (Array.isArray(config.xAxis) ? config.xAxis.map((axis: any) => ({
                ...axis,
                axisLabel: {...defaultTextStyle, ...axis?.axisLabel},
                nameTextStyle: {...defaultTextStyle, ...axis?.nameTextStyle}
            })) : {
                ...config.xAxis,
                axisLabel: {...defaultTextStyle, ...config.xAxis?.axisLabel},
                nameTextStyle: {...defaultTextStyle, ...config.xAxis?.nameTextStyle}
            }) : undefined,
            yAxis: config.yAxis ? (Array.isArray(config.yAxis) ? config.yAxis.map((axis: any) => ({
                ...axis,
                axisLabel: {...defaultTextStyle, ...axis?.axisLabel},
                nameTextStyle: {...defaultTextStyle, ...axis?.nameTextStyle}
            })) : {
                ...config.yAxis,
                axisLabel: {...defaultTextStyle, ...config.yAxis?.axisLabel},
                nameTextStyle: {...defaultTextStyle, ...config.yAxis?.nameTextStyle}
            }) : undefined
        };
    };

    useEffect(() => {
        if (!echartsLib || isGenerating) {
            pendingConfigRef.current = code;
            return;
        }

        if (!isGenerating && !chartInstanceRef.current) {
            if (!chartRef.current) return;

            try {
                const configToRender = pendingConfigRef.current || code;
                const config = JSON.parse(configToRender);
                const mergedConfig = mergeDefaultConfig(config);

                chartInstanceRef.current = echartsLib.init(chartRef.current);
                chartInstanceRef.current.setOption(mergedConfig, true);
            } catch (e) {
                console.error('ECharts 配置解析失败:', e);
            }

            pendingConfigRef.current = '';
        }

        const handleResize = () => {
            chartInstanceRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [code, isGenerating, isDark, echartsLib]);

    useEffect(() => {
        return () => {
            chartInstanceRef.current?.dispose();
            chartInstanceRef.current = null;
            pendingConfigRef.current = '';
        };
    }, []);

    if (isGenerating || isLoading) {
        return (
            <div className={`w-full h-80 my-4 rounded-lg overflow-hidden border flex items-center justify-center ${
                isDark ? 'bg-slate-900/50 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
                <div className={`flex items-center space-x-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <LoadingDots isDark={isDark}/>
                    <span className="text-sm">图表生成中...</span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={chartRef}
            className={`w-full h-80 my-4 rounded-lg overflow-hidden border ${
                isDark ? 'bg-slate-900/50 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
        />
    );
}, (prevProps, nextProps) => {
    if (prevProps.isGenerating !== nextProps.isGenerating) return false;
    if (prevProps.isDark !== nextProps.isDark) return false;
    if (nextProps.isGenerating) return true;
    try {
        const prevConfig = JSON.parse(prevProps.code);
        const nextConfig = JSON.parse(nextProps.code);
        return JSON.stringify(prevConfig) === JSON.stringify(nextConfig);
    } catch {
        return true;
    }
});

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Thinking Bubble Component
interface ThinkingBubbleProps {
    content: string;
    isGenerating: boolean;
    isDark: boolean;
}

const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({content, isGenerating, isDark}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        setIsExpanded(!!isGenerating);
    }, [isGenerating]);

    if (!content && !isGenerating) return null;

    return (
        <div className={`mb-3 rounded-lg overflow-hidden ${
            isDark
                ? 'border border-cyan-500/20 bg-cyan-950/20'
                : 'border border-cyan-200 bg-cyan-50'
        }`}>
            <div
                className={`flex items-center justify-between px-4 py-3 cursor-pointer ${
                    isDark ? 'bg-cyan-950/40 hover:bg-cyan-950/60' : 'bg-cyan-100 hover:bg-cyan-200'
                }`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`flex items-center space-x-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    <Sparkles size={16} className={isGenerating ? 'animate-pulse' : ''}/>
                    <span className="text-sm font-bold uppercase tracking-wider">
            {isGenerating ? '深度思考中...' : '思考过程'}
          </span>
                    {isGenerating && <LoadingDots isDark={isDark}/>}
                </div>
                <button
                    className={`${isDark ? 'text-cyan-400/70 hover:text-cyan-300' : 'text-cyan-500 hover:text-cyan-700'}`}>
                    {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
            </div>
            {isExpanded && (
                <div className={`p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed border-t ${
                    isDark
                        ? 'text-cyan-200/80 bg-black/20 border-cyan-500/10'
                        : 'text-cyan-800 bg-white border-cyan-100'
                }`}>
                    {content}
                    {isGenerating && content && (
                        <span className={`inline-block w-2 h-4 ml-1 align-middle animate-pulse ${
                            isDark ? 'bg-cyan-400' : 'bg-cyan-500'
                        }`}/>
                    )}
                </div>
            )}
        </div>
    );
};

// Suggestions Component
interface SuggestionsProps {
    list: string[];
    onClick: (text: string) => void;
    isDark: boolean;
}

const Suggestions: React.FC<SuggestionsProps> = ({list, onClick, isDark}) => {
    if (!list || list.length === 0) return null;
    return (
        <div className="flex flex-col space-y-3 mt-4 animate-fade-in">
            <div className={`text-sm uppercase tracking-widest font-bold ml-1 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
                建议追问
            </div>
            <div className="flex flex-wrap gap-3">
                {list.map((q, idx) => (
                    <button
                        key={idx}
                        onClick={() => onClick(q)}
                        className={`text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center group ${
                            isDark
                                ? 'bg-slate-800/50 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/40'
                                : 'bg-white border border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300 shadow-sm'
                        }`}
                    >
                        <span>{q}</span>
                        <ArrowRight size={14}
                                    className={`ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                                        isDark ? 'text-cyan-500' : 'text-cyan-400'
                                    }`}/>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Message Item Component
interface MessageItemProps {
    message: Message;
    isLast: boolean;
    isGenerating: boolean;
    onSuggestionClick: (text: string) => void;
    isDark: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({message, isLast, isGenerating, onSuggestionClick, isDark}) => {
    const isAssistant = message.role === 'assistant';

    // Parse thinking tags
    const thinkingRegex = /<(thinking|think)>([\s\S]*?)<\/(thinking|think)>/g;
    const thinkingMatches = [...message.content.matchAll(thinkingRegex)];
    const thinkingContent = thinkingMatches.length > 0
        ? thinkingMatches.map(m => m[2].trim()).join('\n\n---\n\n')
        : null;

    // Parse suggestions
    const suggestionsMatch = message.content.match(/<suggestions>([\s\S]*?)<\/suggestions>/);
    let suggestionsList: string[] = [];
    try {
        if (suggestionsMatch) {
            suggestionsList = JSON.parse(suggestionsMatch[1]);
        }
    } catch (e) {
        // console.warn('Failed to parse suggestions JSON');
    }

    let displayContent = message.content;
    displayContent = displayContent.replace(thinkingRegex, '');
    if (suggestionsMatch) displayContent = displayContent.replace(suggestionsMatch[0], '');

    let displayThinking = thinkingContent;
    const hasThinkingTag = message.content.includes('<thinking>') || message.content.includes('think>');

    if (isGenerating && hasThinkingTag) {
        const lastThinkingIdx = message.content.lastIndexOf('<thinking>');
        const lastThinkIdx = message.content.lastIndexOf('think>');
        const lastOpenIdx = Math.max(lastThinkingIdx, lastThinkIdx);
        const tagLength = lastOpenIdx === lastThinkIdx ? 'think>'.length : '<thinking>'.length;
        const afterLastOpen = message.content.substring(lastOpenIdx + tagLength);
        const hasCloseTag = afterLastOpen.includes('</thinking>') || afterLastOpen.includes('>');

        if (!hasCloseTag) {
            const closedThinking = thinkingMatches.length > 0
                ? thinkingMatches.map(m => m[2].trim()).join('\n\n---\n\n') + '\n\n---\n\n'
                : '';
            displayThinking = closedThinking + afterLastOpen;
            displayContent = message.content.substring(0, lastOpenIdx).replace(thinkingRegex, '');
        }
    }

    displayContent = displayContent.trim();

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(displayContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    return (
        <div className={`flex w-full mb-8 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-1 ${
                    isAssistant
                        ? isDark
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 mr-4'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 mr-4'
                        : isDark
                            ? 'bg-slate-800 ml-4'
                            : 'bg-slate-200 ml-4'
                }`}>
                    {isAssistant
                        ? <Bot size={20} className="text-white"/>
                        : <User size={20} className={isDark ? 'text-slate-300' : 'text-slate-600'}/>
                    }
                </div>

                <div className="flex flex-col min-w-0">
                    {isAssistant && (displayThinking || (isGenerating && hasThinkingTag)) && (
                        <ThinkingBubble
                            content={displayThinking || ''}
                            isGenerating={isGenerating && isLast}
                            isDark={isDark}
                        />
                    )}

                    {(displayContent || (!displayThinking && !hasThinkingTag)) && (
                        <div className={`px-5 py-4 rounded-2xl text-base leading-relaxed shadow-lg ${
                            isAssistant
                                ? isDark
                                    ? 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                : isDark
                                    ? 'bg-cyan-600 text-white rounded-tr-none'
                                    : 'bg-blue-500 text-white rounded-tr-none'
                        }`}>
                            {isAssistant ? (
                                <div className="markdown-body">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({node, ...props}) => (
                                                <a
                                                    {...props}
                                                    className={`${isDark ? 'text-cyan-400' : 'text-blue-500'} hover:underline`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                />
                                            ),
                                            code: ({node, className, children, ...props}: any) => {
                                                const match = /language-(\w+)/.exec(className || '');
                                                const language = match ? match[1] : '';
                                                const code = String(children).replace(/\n$/, '');

                                                if (language === 'echarts') {
                                                    return <EChartsRenderer code={code}
                                                                            isGenerating={isGenerating && isLast}
                                                                            isDark={isDark}/>;
                                                }

                                                return (
                                                    <pre className={`rounded-lg p-4 overflow-x-auto my-3 border ${
                                                        isDark
                                                            ? 'bg-slate-950/50 border-white/5'
                                                            : 'bg-slate-100 border-slate-200'
                                                    }`}>
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                                                );
                                            }
                                        }}
                                    >
                                        {displayContent}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{displayContent}</div>
                            )}

                            {isGenerating && isLast && (
                                <div className={`flex items-center mt-2 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`}>
                                    <LoadingDots isDark={isDark}/>
                                </div>
                            )}
                        </div>
                    )}

                    {isAssistant && suggestionsList.length > 0 && !isGenerating && (
                        <Suggestions list={suggestionsList} onClick={onSuggestionClick} isDark={isDark}/>
                    )}

                    {isAssistant && !isGenerating && displayContent && (
                        <div
                            className={`flex items-center space-x-2 mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            <button
                                onClick={handleCopy}
                                className={`p-1.5 rounded-lg transition-colors ${
                                    copied
                                        ? 'text-green-500'
                                        : isDark
                                            ? 'hover:text-slate-300'
                                            : 'hover:text-slate-600'
                                }`}
                            >
                                {copied ? <Check size={14}/> : <Copy size={14}/>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main AIChat Component
const AIChat: React.FC = () => {
    const navigate = useNavigate();
    const {isDark, toggleTheme} = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Voice Input State
    const [inputMode, setInputMode] = useState<'voice' | 'text'>(
        typeof window !== 'undefined' && window.innerWidth >= 768 ? 'text' : 'voice'
    );
    const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'canceling'>('idle');
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef('');
    const startYRef = useRef(0);

    useEffect(() => {
        setMessages([{
            id: 'init',
            role: 'assistant',
            content: '尊敬的领导，欢迎使用AI问数，请问您需要咨询什么？',
            timestamp: new Date()
        }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages, isGenerating]);

    const handleSend = useCallback(async (text: string = input) => {
        if (!text.trim() || isGenerating) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsGenerating(true);

        abortControllerRef.current = new AbortController();

        const assistantMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date()}]);

        let accumulatedContent = '';

        await streamChatCompletion(
            text,
            conversationId,
            (chunk) => {
                accumulatedContent += chunk;
                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? {...m, content: accumulatedContent} : m
                ));
            },
            (newConversationId) => {
                setIsGenerating(false);
                abortControllerRef.current = null;
                if (newConversationId && newConversationId !== conversationId) {
                    setConversationId(newConversationId);
                }
            },
            (err) => {
                console.error(err);
                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? {...m, content: accumulatedContent + '\n[系统: 连接中断或发生错误]'} : m
                ));
                setIsGenerating(false);
                abortControllerRef.current = null;
            },
            () => {
                setIsGenerating(false);
                abortControllerRef.current = null;
            },
            'user-123',
            abortControllerRef.current.signal
        );
    }, [input, isGenerating, conversationId]);

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    // Voice Recognition Logic
    const initRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("您的浏览器不支持语音识别");
            return null;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    transcriptRef.current = event.results[i][0].transcript;
                }
            }
            if (final) {
                transcriptRef.current = final;
            }
        };

        recognition.onerror = () => {
            setRecordingState('idle');
        };

        return recognition;
    };

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startYRef.current = clientY;
        transcriptRef.current = '';

        if (!recognitionRef.current) {
            recognitionRef.current = initRecognition();
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setRecordingState('recording');
            } catch (err) {
                console.error("Start error", err);
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (recordingState === 'idle') return;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const delta = startYRef.current - clientY;

        if (delta > 60) {
            if (recordingState !== 'canceling') setRecordingState('canceling');
        } else {
            if (recordingState !== 'recording') setRecordingState('recording');
        }
    };

    const handleTouchEnd = () => {
        if (recordingState === 'idle') return;

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        if (recordingState === 'recording') {
            setTimeout(() => {
                if (transcriptRef.current.trim()) {
                    handleSend(transcriptRef.current);
                }
            }, 200);
        }

        setRecordingState('idle');
    };

    const handleReset = () => {
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: '尊敬的领导，欢迎使用AI问数，请问您需要咨询什么？',
            timestamp: new Date()
        }]);
        setConversationId(null);
        setInput('');
        setIsGenerating(false);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const quickActions = [
        {label: '本月净利润分析', prompt: '请分析本月全公司的净利润情况，包括各战区的表现对比'},
        {label: '收入趋势', prompt: '展示最近6个月的收入趋势，并分析主要变化原因'},
    ];

    return (
        <div className={`h-full flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Header */}
            <header
                className={`backdrop-blur-md border-b px-4 h-16 flex items-center justify-between sticky top-0 z-30 ${
                    isDark ? 'bg-slate-950/70 border-white/5' : 'bg-white/80 border-slate-200'
                }`}>
                <button onClick={() => navigate('/')} className={`w-12 h-12 flex items-center justify-center ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                }`}>
                    <ArrowLeft size={28}/>
                </button>
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                        isDark
                            ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-violet-500/20'
                            : 'bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-blue-500/30'
                    }`}>
                        <Bot size={24} className="text-white"/>
                    </div>
                    <div>
                        <h1 className={`font-bold text-lg tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>AI
                            问数助手</h1>
                        <p className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>智能数据分析</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl transition-all duration-200 ${
                            isDark
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-yellow-400'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-amber-500'
                        }`}
                        title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
                    >
                        {isDark ? <Sun size={20}/> : <Moon size={20}/>}
                    </button>
                    <button
                        onClick={handleReset}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
                            isDark
                                ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10'
                                : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'
                        }`}
                        title="重置对话"
                    >
                        <RefreshCw size={22}/>
                    </button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {messages.length === 0 && !isGenerating && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl ${
                            isDark
                                ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-violet-500/30'
                                : 'bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-blue-500/30'
                        }`}>
                            <Sparkles size={48} className="text-white"/>
                        </div>
                        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>您好，我是
                            AI 问数助手</h2>
                        <p className={`text-base mb-10 max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            我可以帮您分析门店经营数据、生成报表、回答财务问题。请输入您的问题或选择下方快捷操作。
                        </p>

                        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSend(action.prompt)}
                                    className={`p-4 rounded-xl border text-left transition-all group ${
                                        isDark
                                            ? 'bg-slate-900/40 border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/60'
                                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 shadow-sm'
                                    }`}
                                >
                                    <div className={`text-sm font-bold mb-1 ${
                                        isDark ? 'text-slate-200 group-hover:text-cyan-400' : 'text-slate-700 group-hover:text-blue-600'
                                    }`}>
                                        {action.label}
                                    </div>
                                    <div
                                        className={`text-xs line-clamp-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {action.prompt}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        isLast={index === messages.length - 1}
                        isGenerating={isGenerating}
                        onSuggestionClick={handleSend}
                        isDark={isDark}
                    />
                ))}

                <div ref={messagesEndRef}/>
            </div>

            {/* Input Area */}
            <div
                className={`border-t p-4 ${isDark ? 'border-white/5 bg-slate-950/80 backdrop-blur-md' : 'border-slate-200 bg-white/80'}`}>
                {/* Quick Suggestions */}
                {messages.length < 3 && !isGenerating && recordingState === 'idle' && (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar mb-4">
                        {['查询汇总数据，分析上月全公司总体的经营情况', '收入最好的三个门店是哪些？'].map(q => (
                            <button
                                key={q}
                                onClick={() => handleSend(q)}
                                className={`whitespace-nowrap px-5 py-3 rounded-full text-sm transition-colors ${
                                    isDark
                                        ? 'bg-slate-900 border border-white/10 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30'
                                        : 'bg-slate-100 border border-slate-200 text-blue-500 hover:bg-blue-50 hover:border-blue-300'
                                }`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center space-x-4">
                    {/* Toggle Mode Button */}
                    <button
                        onClick={() => setInputMode(prev => prev === 'voice' ? 'text' : 'voice')}
                        className={`md:hidden p-2 rounded-full border transition-colors ${
                            isDark
                                ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                                : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {inputMode === 'voice' ? <Keyboard size={28}/> : <AudioLines size={28}/>}
                    </button>

                    {/* Input Control */}
                    <div className="flex-1">
                        {inputMode === 'voice' ? (
                            <button
                                className={`w-full h-12 rounded-xl font-bold text-base tracking-widest transition-all select-none touch-none flex items-center justify-center ${
                                    recordingState !== 'idle'
                                        ? isDark
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                            : 'bg-blue-100 text-blue-500 border border-blue-300'
                                        : isDark
                                            ? 'bg-white/5 text-slate-300 border border-white/10 active:bg-slate-800'
                                            : 'bg-slate-100 text-slate-600 border border-slate-200 active:bg-slate-200'
                                }`}
                                onMouseDown={handleTouchStart}
                                onMouseMove={handleTouchMove}
                                onMouseUp={handleTouchEnd}
                                onMouseLeave={handleTouchEnd}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {recordingState === 'idle' ? '按住 说话' : recordingState === 'recording' ? '松开 发送' : '松开 取消'}
                            </button>
                        ) : (
                            <div className={`relative flex items-center border rounded-xl transition-colors ${
                                isDark
                                    ? 'bg-slate-900 border-white/10 focus-within:border-cyan-500/50'
                                    : 'bg-slate-50 border-slate-200 focus-within:border-blue-300'
                            }`}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleSend()}
                                    placeholder="输入问题..."
                                    className={`flex-1 bg-transparent border-none focus:ring-0 py-3 px-5 text-base ${
                                        isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
                                    }`}
                                    disabled={isGenerating}
                                />
                                {isGenerating ? (
                                    <button
                                        onClick={handleStop}
                                        className={`p-2 mr-2 rounded-lg transition-all animate-pulse ${
                                            isDark
                                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                        }`}
                                        title="停止生成"
                                    >
                                        <Square size={20} fill="currentColor"/>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim()}
                                        className={`p-2 mr-2 rounded-lg transition-all ${
                                            input.trim()
                                                ? isDark
                                                    ? 'bg-cyan-500 text-slate-950'
                                                    : 'bg-blue-500 text-white'
                                                : isDark
                                                    ? 'bg-slate-800 text-slate-600'
                                                    : 'bg-slate-200 text-slate-400'
                                        }`}
                                    >
                                        <Send size={20}/>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <p className={`text-xs text-center mt-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    AI 生成内容仅供参考，请以实际数据为准
                </p>
            </div>

            {/* Voice Recording Overlay */}
            {recordingState !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div
                        className={`w-48 h-48 rounded-2xl flex flex-col items-center justify-center space-y-5 backdrop-blur-xl shadow-2xl transition-colors ${
                            recordingState === 'canceling'
                                ? 'bg-red-500/80'
                                : isDark
                                    ? 'bg-slate-900/80'
                                    : 'bg-white/90'
                        }`}>
                        <div className="text-white">
                            {recordingState === 'canceling' ? (
                                <div
                                    className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center animate-bounce">
                                    <Trash2 size={40}/>
                                </div>
                            ) : (
                                <div className="w-20 h-20 flex items-center justify-center">
                                    <Mic size={50}
                                         className={`animate-pulse ${isDark ? 'text-white' : 'text-slate-700'}`}/>
                                </div>
                            )}
                        </div>
                        <p className={`text-base font-bold ${
                            recordingState === 'canceling'
                                ? 'text-white'
                                : isDark
                                    ? 'text-slate-300'
                                    : 'text-slate-700'
                        }`}>
                            {recordingState === 'canceling' ? '松开手指，取消发送' : '手指上滑，取消发送'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;
