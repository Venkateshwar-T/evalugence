'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Square } from 'lucide-react';
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
  "Did you know? Model metadata in the Settings page reveals useful details like context window size, input cost, and maximum output tokens."
];


interface GlobalPromptInputProps {
  placeholder?: string;
  isFixed?: boolean;
  onSend?: (msg: string) => void;
  isGenerating?: boolean;
  onStop?: () => void;
}


export default function GlobalPromptInput({ 
  placeholder = "Type a prompt...",
  isFixed = true,
  onSend,
  isGenerating = false,
  onStop
}: GlobalPromptInputProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const [enableHistory, setEnableHistory] = useState(false);
  const [randomFact, setRandomFact] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition and Footer Data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set history status
      const historyPref = localStorage.getItem('evalugence_enable_history');
      if (historyPref !== null) {
        setEnableHistory(historyPref === 'true');
      }
      // Pick random fact
      setRandomFact(APP_FACTS[Math.floor(Math.random() * APP_FACTS.length)]);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setMessage(prev => prev + transcript + ' ');
            } else {
              currentTranscript += transcript;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error === 'network') {
            alert("Speech recognition network error. This usually happens if your browser (like Brave or Firefox) doesn't support the Google Speech backend, or if you are running on an insecure network context.");
          } else if (event.error === 'not-allowed') {
            alert("Microphone access was denied. Please allow microphone permissions in your browser settings.");
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
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
    if (!message.trim()) return;
    
    if (isListening) toggleListen(); // Stop mic if sending

    if (onSend) onSend(message);
    
    // Reset state
    setMessage('');
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
          
          <div className="flex items-end w-full">
            {/* Auto-expanding Textarea */}
            <textarea 
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              placeholder={isListening ? "Listening..." : placeholder}
              className={`flex-1 max-h-[120px] md:max-h-[200px] bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white py-2.5 md:py-2 px-2 md:px-3 text-[14px] md:text-[16px] placeholder:text-gray-400 dark:placeholder:text-gray-500 ${isListening ? 'text-red-600 dark:text-red-400 font-medium' : ''} ${message ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'} m-0 box-border`}
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
                <Button 
                  variant="primary"
                  size="icon"
                  onClick={onStop}
                  className="rounded-full shadow-md hover:scale-105 h-8 w-8 md:h-10 md:w-10 ml-0.5 md:ml-1 transition-transform bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200"
                  title="Stop Generating"
                >
                  <Square className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                </Button>
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
