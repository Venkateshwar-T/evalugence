import Footer from '@/components/landing/Footer';
import { SplitSquareHorizontal, MessageSquare, BarChart3, SlidersHorizontal, History, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: SplitSquareHorizontal,
      title: "Multi-Model Comparison",
      description: "Run the same prompt across up to 6 different AI models simultaneously. Compare outputs from OpenAI, Anthropic, Google, and more side-by-side to find the perfect fit for your specific use case."
    },
    {
      icon: MessageSquare,
      title: "Single Model Testing",
      description: "Dive deep into a single model's capabilities in the dedicated Lab environment. Have a back-and-forth conversation, test long contexts, and analyze responses without distractions."
    },
    {
      icon: BarChart3,
      title: "Metrics & Metadata Insights",
      description: "Stop guessing performance. We automatically calculate Time-to-First-Token (TTFT) and throughput, plus give you instant access to Model Metadata like context windows and max tokens."
    },
    {
      icon: SlidersHorizontal,
      title: "Global System Prompting",
      description: "Shape the personality and constraints of all models simultaneously. Set a powerful Global System Prompt to ensure perfectly identical baselines when testing multiple LLMs."
    },
    {
      icon: History,
      title: "Session Management",
      description: "Save your comparison sessions and single-model chats locally. Resume your testing workflows right where you left off, entirely managed within your browser's IndexedDB."
    },
    {
      icon: ShieldCheck,
      title: "Local-First Security",
      description: "Your API keys are stored securely in your browser's local storage. Prompts pass through our minimal serverless API proxy purely to bypass CORS, without ever being logged or saved on our end."
    }
  ];

  return (
    <main className="flex-1 flex flex-col w-full min-h-screen relative">
      {/* Background glow container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] max-w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] max-w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <span className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-3 block">Features</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Everything you need to evaluate AI
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            A comprehensive suite of tools built for developers, researchers, and prompt engineers to benchmark LLMs effectively.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 mb-16 md:mb-24">
          {features.map((feature, idx) => (
            <div key={idx} className="group p-5 md:p-8 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-4 md:mb-6 shadow-sm group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
                <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-[15px] flex-grow">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0a0a0a] p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="relative z-10 flex flex-col items-center">
            <Zap className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Ready to start comparing?</h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8 max-w-xl mx-auto">
              Bring your API keys and experience the fastest way to evaluate language models locally.
            </p>
            <Link 
              href="/lab" 
              className="px-6 py-3 md:px-8 md:py-4 text-sm md:text-base bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              Open the Lab
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
