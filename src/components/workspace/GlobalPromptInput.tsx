'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Paperclip, X, File as FileIcon, Image as ImageIcon, Square, Brain } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface Attachment {
  name: string;
  type: string;
  base64: string;
}

interface GlobalPromptInputProps {
  placeholder?: string;
  isFixed?: boolean;
  onSend?: (msg: string, attachments?: Attachment[]) => void;
  isGenerating?: boolean;
  onStop?: () => void;
}

interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
}

export default function GlobalPromptInput({ 
  placeholder = "Type a prompt...",
  isFixed = true,
  onSend,
  isGenerating = false,
  onStop
}: GlobalPromptInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
      // Cleanup Object URLs
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
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
    
    const textarea = e.target;
    textarea.style.height = 'auto'; // Reset height to recalculate
    const maxHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 120 : 200;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`; // Cap height dynamically
  };

  // Update your handleSend reset line as well:
  // Remove the window.innerWidth ternary check entirely here:
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed && removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return;
    
    if (isListening) toggleListen(); // Stop mic if sending

    const attachments: Attachment[] = [];
    if (files.length > 0) {
      for (const f of files) {
        try {
          const b64 = await toBase64(f.file);
          attachments.push({
            name: f.file.name,
            type: f.file.type,
            base64: b64
          });
        } catch (e) {
          console.error("Failed to read file", f.file.name);
        }
      }
    }

    if (onSend) onSend(message, attachments.length > 0 ? attachments : undefined);
    
    // Reset state
    setMessage('');
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = typeof window !== 'undefined' && window.innerWidth < 768 ? '32px' : '40px';
    }
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
          
          {/* File Previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-2 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
              {files.map(f => (
                <div key={f.id} className="relative group flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5 pr-3 border border-gray-200 dark:border-gray-700 max-w-[200px]">
                  {f.previewUrl ? (
                    <img src={f.previewUrl} alt={f.file.name} className="w-8 h-8 rounded-md object-cover bg-white" />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <FileIcon className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{f.file.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{f.file.size < 1024 * 1024 ? `${(f.file.size / 1024).toFixed(1)} KB` : `${(f.file.size / 1024 / 1024).toFixed(1)} MB`}</span>
                  </div>
                  <button 
                    onClick={() => removeFile(f.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end w-full">
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf,.txt,.csv,.json"
            />
            
            {/* Add Files Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white h-8 w-8 md:h-10 md:w-10"
            >
              <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

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
                  disabled={!message.trim() && files.length === 0}
                  onClick={handleSend}
                  className="rounded-full shadow-md hover:scale-105 h-8 w-8 md:h-10 md:w-10 ml-0.5 md:ml-1 transition-transform"
                >
                  <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
