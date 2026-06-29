'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Square, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const APP_FACTS = [
  "Did you know? You can adjust Global System Prompts in Settings to shape the personality of all models at once.",
  "Tip: Use the Compare mode to test the exact same prompt across up to five AI models simultaneously.",
  "Pro tip: You can view real-time performance metrics like Time-to-First-Token by opening the side menu.",
  "Did you know? All your API keys are stored securely and only locally in your own browser.",
  "Tip: Switch on 'Volatile API Keys' in Settings if you're using a shared device for maximum security.",
  "Fun Fact: This platform was built specifically to evaluate and test bleeding-edge AI models side-by-side.",
  "Tip: You can easily switch between Light, Dark, and System themes in the Settings to match your preference.",
  "Tip: You can click the gear icon to configure parameters and system prompts for each model individually."
];


interface GlobalPromptInputProps {
  placeholder?: string;
  isFixed?: boolean;
  onSend?: (msg: string, attachments?: File[]) => void;
  isGenerating?: boolean;
  onStop?: () => void;
  providerId?: string;
  modelName?: string;
}


export default function GlobalPromptInput({ 
  placeholder = "Type a prompt...",
  isFixed = true,
  onSend,
  isGenerating = false,
  onStop,
  providerId,
  modelName
}: GlobalPromptInputProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [supportsImage, setSupportsImage] = useState(false);
  const [supportsVideo, setSupportsVideo] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [enableHistory, setEnableHistory] = useState(false);
  const [randomFact, setRandomFact] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Parse Metadata for input modalities
  useEffect(() => {
    let img = false;
    let vid = false;

    if (providerId === 'google') {
      img = true;
      vid = true; // Gemini 1.5 natively supports video
    } else if (providerId === 'openai') {
      if (modelName && (modelName.includes('gpt-4o') || modelName.includes('gpt-4-turbo'))) {
        img = true;
      }
    } else if (providerId === 'openrouter' && modelName && typeof window !== 'undefined') {
      try {
        const metaCache = JSON.parse(localStorage.getItem('evalugence_model_metadata') || '{}');
        const meta = metaCache[modelName];
        if (meta?.architecture?.modality) {
          const modalityStr = String(meta.architecture.modality).toLowerCase();
          if (modalityStr.includes('image')) img = true;
          if (modalityStr.includes('video')) vid = true;
        }
      } catch (e) {
        // ignore
      }
    }

    setSupportsImage(img);
    setSupportsVideo(vid);
    // Clear attachments if switching to a model that doesn't support them
    if (!img && !vid) {
      setAttachments([]);
    }
  }, [providerId, modelName]);

  // Initialize Speech Recognition and Footer Data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setMessage(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
      }

      setEnableHistory(localStorage.getItem('evalugence_enable_history') === 'true');
      setRandomFact(APP_FACTS[Math.floor(Math.random() * APP_FACTS.length)]);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setMessage('');
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Your browser does not support Speech Recognition.");
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (message) {
        const maxHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 120 : 200;
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
      }
    }
  }, [message]);


  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    
    if (isListening) toggleListen(); // Stop mic if sending

    if (onSend) onSend(message, attachments);
    
    // Reset state
    setMessage('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const containerClass = isFixed 
    ? "fixed bottom-14 md:bottom-0 left-0 right-0 w-full z-40 pointer-events-none pt-12 pb-4 md:pb-6 px-4 md:px-6" 
    : "w-full z-40";

  return (
    <div className={containerClass}>
      {isFixed && (
        <div 
          className="absolute inset-0 bg-gray-50/80 dark:bg-black/80 backdrop-blur-lg pointer-events-none -z-10"
          style={{ 
            maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)' 
          }} 
        />
      )}
      <div className="max-w-4xl mx-auto w-full pointer-events-auto">
        <div className={`flex flex-col bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800/80 rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-1 md:p-2.5 relative transition-all focus-within:ring-4 focus-within:ring-black/5 dark:focus-within:ring-white/5 focus-within:border-black/20 dark:focus-within:border-white/20 ${isListening ? 'ring-2 ring-red-500/50 border-red-500/50' : ''}`}>
          
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1 w-full">
              {attachments.map((file, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="attachment" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{file.type.split('/')[1] || 'FILE'}</div>
                  )}
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end w-full">
            {/* Left side attachment button (if supported) */}
            {(supportsImage || supportsVideo) && (
              <div className="flex items-center justify-center pl-1 shrink-0">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  multiple
                  accept={supportsVideo && supportsImage ? "image/*,video/*" : supportsImage ? "image/*" : supportsVideo ? "video/*" : "*"} 
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      setAttachments(prev => [...prev, ...files].slice(0, 5)); // Limit to 5
                    }
                  }}
                />
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full h-8 w-8 md:h-10 md:w-10 transition-all text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  title={`Upload ${supportsImage && supportsVideo ? 'image or video' : supportsImage ? 'image' : supportsVideo ? 'video' : 'file'}`}
                >
                  <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            )}
            {/* Auto-expanding Textarea */}
            <textarea 
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              placeholder={isListening ? "Listening..." : placeholder}
              className={`flex-1 max-h-[120px] md:max-h-[200px] bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white pt-0 pb-2.5 md:py-2 px-2 md:px-3 text-[14px] md:text-[16px] placeholder:text-gray-400 dark:placeholder:text-gray-500 ${isListening ? 'text-red-600 dark:text-red-400 font-medium' : ''} ${message ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'} m-0 box-border`}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isGenerating) {
                    handleSend();
                  }
                }
              }}
            />
            {/* Right side buttons */}
            <div className="flex items-center gap-1 shrink-0 px-1">

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleListen}
                className={`rounded-full h-8 w-8 md:h-10 md:w-10 transition-all ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:text-red-600 hover:bg-red-100' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Mic className={`w-4 h-4 md:w-5 md:h-5 ${isListening ? 'animate-pulse' : ''}`} />
              </Button>
              {isGenerating ? (
                <div className="relative group/stop">
                  <Button 
                    variant="primary"
                    size="icon"
                    onClick={onStop}
                    className="rounded-full shadow-md hover:scale-105 h-8 w-8 md:h-10 md:w-10 ml-0.5 md:ml-1 transition-transform bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200"
                  >
                    <Square className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                  </Button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-xl opacity-0 group-hover/stop:opacity-100 invisible group-hover/stop:visible transition-all whitespace-nowrap shadow-2xl z-50 pointer-events-none">Stop Generating</div>
                </div>
              ) : (
                <Button 
                  variant="primary"
                  size="icon"
                  disabled={!message.trim()}
                  onClick={handleSend}
                  className="rounded-full shadow-md hover:scale-105 h-8 w-8 md:h-10 md:w-10 ml-0.5 md:ml-1 transition-transform"
                >
                  <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info text */}
        {!isFixed && (
          <div className="mt-2 md:mt-3 flex flex-col md:flex-row items-center justify-center text-[10px] md:text-xs text-gray-500 gap-1.5 md:gap-4 text-center px-4">
            {/* History Status */}
            {enableHistory ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span>Chats are auto-saved to your <Link href="/dashboard" className="underline hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</Link>.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-500 shrink-0" />
                <span>History is off. Enable it in <Link href="/settings" className="font-bold underline hover:text-gray-900 dark:hover:text-white transition-colors">Settings</Link>.</span>
              </div>
            )}
            
            <span className="hidden md:inline-block text-gray-300 dark:text-gray-700">•</span>
            
            {/* Random Fact */}
            <span className="italic opacity-80 max-w-[85%] md:max-w-none">{randomFact}</span>
          </div>
        )}
      </div>
    </div>
  );
}
