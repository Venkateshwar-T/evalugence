'use client';

import { useState, useEffect } from 'react';
import { Info, Settings2, Sliders, Shield, Monitor, Moon, Sun, Trash2, Power, Database, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useModelConfig, ModelConfig, DEFAULT_CONFIG } from '@/hooks/useModelConfig';
import { useTheme } from 'next-themes';
import ModelMetadataViewer from '@/components/workspace/ModelMetadataViewer';

interface ConfigItemProps {
  label: string;
  tooltip: string;
  position?: 'top' | 'bottom';
  align?: 'left' | 'right';
  children: React.ReactNode;
}

const ConfigItem = ({ label, tooltip, position = 'bottom', align = 'left', children }: ConfigItemProps) => (
  <div className="flex flex-col gap-2 relative z-10 hover:z-50">
    {label && (
      <div className="flex items-center gap-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mt-0.5">
          {label}
        </label>
        <div className="hidden md:flex group relative items-center justify-center cursor-help">
          <Info className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          
          {/* Tooltip */}
          <div className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} w-64 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-[99999] normal-case tracking-normal group-hover:translate-y-0 ${position === 'bottom' ? 'top-full mt-2 -translate-y-1' : 'bottom-full mb-2 translate-y-1'}`}>
            <div className={`absolute ${align === 'left' ? 'left-4' : 'right-4'} border-4 border-transparent ${position === 'bottom' ? 'bottom-full border-b-gray-900 dark:border-b-white' : 'top-full border-t-gray-900 dark:border-t-white'}`}></div>
            {tooltip}
          </div>
        </div>
      </div>
    )}
    {children}
  </div>
);

const InfoTooltip = ({ text, position = 'top', align = 'left' }: { text: string, position?: 'top'|'bottom', align?: 'left'|'right' }) => (
  <div className="hidden md:flex group relative items-center justify-center cursor-help">
    <Info className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
    <div className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} w-64 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-[99999] normal-case tracking-normal group-hover:translate-y-0 ${position === 'bottom' ? 'top-full mt-2 -translate-y-1' : 'bottom-full mb-2 translate-y-1'}`}>
      <div className={`absolute ${align === 'left' ? 'left-4' : 'right-4'} border-4 border-transparent ${position === 'bottom' ? 'bottom-full border-b-gray-900 dark:border-b-white' : 'top-full border-t-gray-900 dark:border-t-white'}`}></div>
      {text}
    </div>
  </div>
);


const SliderInput = ({ min, max, step, value, onChange }: { min: string, max: string, step: string, value: string, onChange: (val: string) => void }) => {
  return (
    <div className="flex items-center gap-4">
      <input 
        type="range" min={min} max={max} step={step} value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white" 
      />
      <input 
        type="number" min={min} max={max} step={step} value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-16 bg-transparent border-b border-gray-200 dark:border-gray-800 p-1 text-sm font-medium text-center focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white transition-colors" 
      />
    </div>
  );
};

type Tab = 'general' | 'models' | 'privacy';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const { theme, setTheme } = useTheme();
  
  // Model Config State
  const { config, saveConfig, resetToDefault, isLoaded } = useModelConfig('global');
  const [localConfig, setLocalConfig] = useState<ModelConfig>(DEFAULT_CONFIG);

  // General Config State
  const [startupUrl, setStartupUrl] = useState('/');
  const [showThemeNav, setShowThemeNav] = useState(true);

  // Privacy Config State
  const [autoDeleteKeys, setAutoDeleteKeys] = useState(true);
  const [enableHistory, setEnableHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Metadata Cache State
  const [cachedModels, setCachedModels] = useState<string[]>([]);
  const [selectedMetaModel, setSelectedMetaModel] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isLoaded && config) {
      setLocalConfig(config);
    }
    
    setStartupUrl(localStorage.getItem('evalugence_startup_url') || '/');
    setShowThemeNav(localStorage.getItem('evalugence_show_theme_nav') !== 'false');
    setAutoDeleteKeys(localStorage.getItem('evalugence_auto_delete_keys') !== 'false');
    setEnableHistory(localStorage.getItem('evalugence_enable_history') === 'true');

    try {
      const metaCache = JSON.parse(localStorage.getItem('evalugence_model_metadata') || '{}');
      setCachedModels(Object.keys(metaCache));
    } catch (e) {
      setCachedModels([]);
    }
  }, [config, isLoaded]);

  const effortLevels = ['Default', 'Low', 'Medium', 'High'];

  const updateField = (key: keyof ModelConfig, value: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveModels = () => {
    saveConfig(localConfig);
  };

  const handleCancelModels = () => {
    setLocalConfig(config);
  };

  const handleDefaultModels = () => {
    setLocalConfig(DEFAULT_CONFIG);
  };

  const hasModelChanges = JSON.stringify(config) !== JSON.stringify(localConfig);

  // General Handlers
  const handleStartupUrlChange = (url: string) => {
    setStartupUrl(url);
    localStorage.setItem('evalugence_startup_url', url);
  };

  const handleToggleThemeNav = () => {
    const newVal = !showThemeNav;
    setShowThemeNav(newVal);
    localStorage.setItem('evalugence_show_theme_nav', newVal.toString());
    window.dispatchEvent(new Event('theme_nav_change'));
  };

  // Privacy Handlers
  const handleDeleteSessions = () => {
    if (confirm("Are you sure you want to delete all stored chat sessions?")) {
      localStorage.removeItem('evalugence_sessions');
      alert("All chat sessions have been deleted.");
    }
  };

  const handleToggleAutoDeleteKeys = () => {
    const newVal = !autoDeleteKeys;
    setAutoDeleteKeys(newVal);
    localStorage.setItem('evalugence_auto_delete_keys', newVal.toString());
  };

  const handleToggleEnableHistory = () => {
    const newVal = !enableHistory;
    setEnableHistory(newVal);
    localStorage.setItem('evalugence_enable_history', newVal.toString());
  };

  const handleDeleteAllApiKeys = () => {
    if (confirm("Are you sure you want to delete all connected API keys? You will need to re-enter them to use the models.")) {
      localStorage.removeItem('evalugence_providers');
      window.dispatchEvent(new Event('evalugence_providers_updated'));
      alert("All API keys have been deleted.");
    }
  };

  const handleDeleteAllData = () => {
    if (confirm("WARNING: This will permanently delete ALL site data, including your connected API keys, all chat sessions, presets, and preferences. You will be logged out of all providers. Are you absolutely sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <main className="flex-1 flex w-full min-h-screen bg-transparent relative pt-[80px] md:pt-24 pb-8 md:pb-12">
      {/* Background glow container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[60vw] max-w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[60vw] max-w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
      </div>
      
      <div className="flex flex-row w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 gap-2 md:gap-8 relative z-10">
        
        {/* Left Sidebar */}
        <div className="w-10 md:w-64 shrink-0 flex flex-col gap-2 sticky top-[80px] md:top-24 self-start items-center md:items-stretch">
          <h1 className="hidden md:block text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 px-4">Settings</h1>
          
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center justify-center md:justify-start gap-3 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-3 rounded-full md:rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'general' ? 'bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-800' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 border border-transparent'}`}
            title="General"
          >
            <Settings2 className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
            <span className="hidden md:block">General</span>
          </button>

          <button 
            onClick={() => setActiveTab('models')}
            className={`flex items-center justify-center md:justify-start gap-3 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-3 rounded-full md:rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'models' ? 'bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-800' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 border border-transparent'}`}
            title="Model Configurations"
          >
            <Sliders className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
            <span className="hidden md:block whitespace-nowrap overflow-hidden text-ellipsis">Models</span>
          </button>

          <button 
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center justify-center md:justify-start gap-3 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-3 rounded-full md:rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'privacy' ? 'bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-800' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 border border-transparent'}`}
            title="Privacy"
          >
            <Shield className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
            <span className="hidden md:block">Privacy</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="flex flex-col gap-2 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-0.5 md:gap-1">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">General Preferences</h2>
                <p className="text-xs md:text-sm text-gray-500">Customize the appearance and core behavior of your application.</p>
              </div>

              <div className="flex flex-col gap-3 md:gap-4 mt-1 md:mt-0">
                
                {/* Theme Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm gap-3 md:gap-4">
                  <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-sm">
                    <h3 className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white">Theme</h3>
                    <p className="text-xs md:text-sm text-gray-500">Select your preferred application color scheme.</p>
                  </div>
                  <div className="flex p-1 bg-gray-100 dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 w-full md:w-auto">
                    {[
                      { id: 'system', icon: Monitor, label: 'System' },
                      { id: 'light', icon: Sun, label: 'Light' },
                      { id: 'dark', icon: Moon, label: 'Dark' }
                    ].map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => setTheme(t.id)} 
                        className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${mounted && theme === t.id ? 'bg-white dark:bg-[#222] text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-gray-700/50' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                      >
                        <t.icon className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Startup URL Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm gap-3 md:gap-4">
                  <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-sm">
                    <h3 className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white">URL at Startup</h3>
                    <p className="text-xs md:text-sm text-gray-500">Choose which page opens automatically when you navigate to the root domain.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-1 md:mt-0">
                    {[
                      { label: 'Landing', val: '/' },
                      { label: 'Lab', val: '/lab' },
                      { label: 'Dashboard', val: '/dashboard' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => handleStartupUrlChange(opt.val)}
                        className={`flex-1 md:flex-none px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border cursor-pointer text-center ${
                          startupUrl === opt.val 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm shadow-blue-500/10' 
                            : 'bg-white dark:bg-[#111] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Switch NavBar Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm gap-3 md:gap-4">
                  <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-sm">
                    <h3 className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white">Show Theme Switch in NavBar</h3>
                    <p className="text-xs md:text-sm text-gray-500">Toggle the visibility of the quick theme switch button in the top navigation bar.</p>
                  </div>
                  <button 
                    onClick={handleToggleThemeNav}
                    className={`relative inline-flex h-6 w-11 md:h-7 md:w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0 self-start md:self-auto mt-1 md:mt-0 ${showThemeNav ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow-sm transition-transform ${showThemeNav ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODEL CONFIGURATIONS TAB */}
          {activeTab === 'models' && (
            <div className="flex flex-col gap-2 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-0.5 md:gap-1">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Model Configurations</h2>
                <p className="text-xs md:text-sm text-gray-500">Manage your system instructions and view cached metadata from models you've used.</p>
              </div>

              <div className="flex flex-col gap-4 md:gap-6 mt-1 md:mt-0">
                
                {/* System Prompt Card */}
                <div className="flex flex-col md:flex-row md:items-start justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm gap-4 md:gap-6">
                  <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-[240px] shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white">Global System Prompt</h3>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">Enter detailed instructions for the AI's persona, rules, boundaries, and formatting preferences.</p>
                  </div>
                  <div className="w-full flex flex-col gap-3">
                    <textarea 
                      value={localConfig.systemPrompt}
                      onChange={(e) => updateField('systemPrompt', e.target.value)}
                      className="w-full h-40 md:h-48 bg-gray-50/50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-5 text-[13px] md:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-y text-gray-900 dark:text-white"
                      placeholder="Enter system instructions here..."
                    />
                    <div className="flex justify-end">
                      <Button variant="secondary" onClick={handleDefaultModels} className="text-xs md:text-sm bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 rounded-lg font-bold cursor-pointer px-3 py-1.5 h-auto border border-transparent dark:border-gray-800/50">
                        Restore to default
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cached Models Section */}
                <div className="flex flex-col gap-3 md:gap-4 mt-1 md:mt-2">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <h3 className="text-[17px] md:text-lg font-bold text-gray-900 dark:text-white">Cached Models & Metadata</h3>
                    <p className="text-xs md:text-sm text-gray-500">A list of all AI models you have connected to. Click on any model to view its metadata.</p>
                  </div>

                  {cachedModels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 md:py-10 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
                      <Database className="w-6 h-6 md:w-8 md:h-8 text-gray-300 dark:text-gray-700 mb-2 md:mb-3" />
                      <p className="text-[13px] md:text-sm font-medium text-gray-500 text-center">No models cached yet.</p>
                      <p className="text-[11px] md:text-xs text-gray-400 mt-1 text-center px-4 md:px-0">Connect and select models in the Lab to store their metadata.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
                      {cachedModels.map(model => (
                        <button
                          key={model}
                          onClick={() => setSelectedMetaModel(model)}
                          className="flex items-center justify-between p-3.5 md:p-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all group cursor-pointer text-left"
                        >
                          <div className="flex flex-col overflow-hidden mr-2">
                            <span className="font-bold text-xs md:text-[13px] text-gray-900 dark:text-white truncate">{model}</span>
                            <span className="text-[10px] md:text-[11px] text-gray-500 font-medium group-hover:text-blue-500 transition-colors mt-0.5">View Metadata</span>
                          </div>
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="flex flex-col gap-2 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-0.5 md:gap-1">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Privacy & Security</h2>
                <p className="text-xs md:text-sm text-gray-500">Manage your local data, API keys, and session history.</p>
              </div>

              <div className="flex flex-col gap-3 md:gap-4 mt-1 md:mt-0">
                
                {/* Enable History Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm gap-3 md:gap-4">
                  <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-sm">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white">Enable Chat History</h3>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">Save your recent sessions to the Dashboard for later access.</p>
                  </div>
                  <button 
                    onClick={handleToggleEnableHistory}
                    className={`relative inline-flex h-6 w-11 md:h-7 md:w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0 self-start md:self-auto mt-1 md:mt-0 ${enableHistory ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow-sm transition-transform ${enableHistory ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Volatile API Keys Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm gap-3 md:gap-4">
                  <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-sm">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white">Volatile API Keys</h3>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">Always delete API keys on refresh for maximum security on shared devices.</p>
                  </div>
                  <button 
                    onClick={handleToggleAutoDeleteKeys}
                    className={`relative inline-flex h-6 w-11 md:h-7 md:w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0 self-start md:self-auto mt-1 md:mt-0 ${autoDeleteKeys ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow-sm transition-transform ${autoDeleteKeys ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Delete Stored Chat Sessions Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm gap-3 md:gap-4">
                  <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-sm">
                    <h3 className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white">Clear Stored Chat Sessions</h3>
                    <p className="text-xs md:text-sm text-gray-500">Erase all previous chat histories from your local browser storage.</p>
                  </div>
                  <Button onClick={handleDeleteSessions} variant="outline" className="w-full md:w-auto gap-1.5 md:gap-2 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 text-[13px] md:text-sm h-9 md:h-10 mt-1 md:mt-0">
                    Clear Sessions
                  </Button>
                </div>

                {/* Danger Zone */}
                <div className="flex flex-col gap-3 md:gap-4 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-4 md:p-6 mt-2 md:mt-4">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                    <h3 className="text-[13px] md:text-[15px] font-bold text-red-600 dark:text-red-500 uppercase tracking-widest leading-none">Danger Zone</h3>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-red-100 dark:border-red-900/30 rounded-2xl shadow-sm gap-3 md:gap-4">
                    <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-sm">
                      <h4 className="text-[14px] md:text-base font-bold text-gray-900 dark:text-white">Delete All API Keys</h4>
                      <p className="text-[11px] md:text-sm text-gray-500">Remove all connected provider API keys from this browser.</p>
                    </div>
                    <Button onClick={handleDeleteAllApiKeys} variant="outline" className="w-full md:w-auto gap-1.5 md:gap-2 rounded-xl border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900/50 dark:hover:bg-red-900/20 shrink-0 text-[13px] md:text-sm h-9 md:h-10 mt-1 md:mt-0">
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Delete API Keys
                    </Button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border border-red-100 dark:border-red-900/30 rounded-2xl shadow-sm gap-3 md:gap-4">
                    <div className="flex flex-col gap-0.5 md:gap-1 md:max-w-sm">
                      <h4 className="text-[14px] md:text-base font-bold text-gray-900 dark:text-white">Hard Reset</h4>
                      <p className="text-[11px] md:text-sm text-gray-500">Completely wipe API keys, sessions, presets, and preferences.</p>
                    </div>
                    <Button onClick={handleDeleteAllData} className="w-full md:w-auto gap-1.5 md:gap-2 rounded-xl !bg-red-600 dark:!bg-red-600 hover:!bg-red-700 dark:hover:!bg-red-700 !text-white border-transparent shrink-0 text-[13px] md:text-sm h-9 md:h-10 mt-1 md:mt-0">
                      <Power className="w-3.5 h-3.5 md:w-4 md:h-4" /> Hard Reset
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Action Bar for Model Configs */}
      <AnimatePresence>
        {activeTab === 'models' && hasModelChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[80px] md:bottom-8 left-1/2 -translate-x-1/2 z-[50000] flex items-center gap-2 sm:gap-3 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-full shadow-2xl px-2 sm:px-3 py-2 sm:py-3 pl-4 sm:pl-6 w-[90%] sm:w-auto max-w-md justify-between sm:justify-start"
          >
            <span className="hidden sm:inline text-sm font-bold text-red-500 dark:text-red-400 mr-4 tracking-wide uppercase">Unsaved changes</span>
            <Button variant="ghost" onClick={handleCancelModels} className="rounded-full cursor-pointer text-xs sm:text-sm px-3 sm:px-4">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveModels} className="rounded-full shadow-md cursor-pointer text-xs sm:text-sm px-4 sm:px-6">
              Save Changes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <ModelMetadataViewer isOpen={!!selectedMetaModel} onClose={() => setSelectedMetaModel(null)} modelName={selectedMetaModel || ''} />
    </main>
  );
}
