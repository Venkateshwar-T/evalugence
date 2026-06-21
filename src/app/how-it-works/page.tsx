'use client';

import { motion } from 'framer-motion';
import { Key, ShieldCheck, Zap, Activity, SplitSquareHorizontal, Layers, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/landing/Footer';

export default function HowItWorks() {
  const steps = [
    {
      icon: Key,
      title: "1. Connect Your API Keys Locally",
      description: "Paste your API keys for OpenAI, Anthropic, Google, Groq, or others. We store them purely in your browser's local session. We never write your keys to a server or database."
    },
    {
      icon: SplitSquareHorizontal,
      title: "2. Select Testing Mode",
      description: "Run the test on a single model or choose up to 5 models to run side-by-side. You can select models across different providers to get a comprehensive comparison of their strengths, weaknesses, and behaviors."
    },
    {
      icon: Layers,
      title: "3. System Prompts & Metadata",
      description: "Define a Global System Prompt to shape the personality of all models at once. You can also view native Model Metadata (like max context lengths) to understand their exact capabilities before testing."
    },
    {
      icon: Zap,
      title: "4. Execute & Stream",
      description: "Hit send and your prompt is broadcasted directly from your browser to each provider's API. Responses stream back in parallel, ensuring a blazing fast evaluation workflow."
    },
    {
      icon: Activity,
      title: "5. Analyze Performance Metrics",
      description: "As responses stream, Evalugence automatically calculates and displays Time-to-First-Token (TTFT), Token generation speed (Tokens/sec), and an estimated cost based on token usage."
    }
  ];

  return (
    <main className="flex-1 flex flex-col w-full min-h-screen relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] max-w-[800px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[50vw] max-w-[500px] h-[300px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-20 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 pt-6 md:pt-10">
          <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 block">Under the Hood</span>
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 md:mb-6">
            How Evalugence Works
          </h1>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            A transparent, secure, and blazing-fast environment to test, evaluate, and compare AI models side-by-side using your own API keys.
          </p>
        </div>

        {/* Timeline / Steps */}
        <div className="flex flex-col gap-8 md:gap-12 relative before:absolute before:inset-0 before:ml-5 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-gray-600 before:to-transparent">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex items-center justify-between w-full group ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className="hidden md:block w-5/12" />
              
              <div className="absolute left-5 md:left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#0a0a0a] border-4 border-gray-100 dark:border-gray-900 shadow-sm flex items-center justify-center z-10 group-hover:scale-110 group-hover:border-blue-100 dark:group-hover:border-blue-900/50 transition-all duration-300">
                <step.icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className={`w-full md:w-5/12 pl-16 md:pl-0 flex flex-col ${isEven ? 'md:items-start md:text-left' : 'md:items-end md:text-right'}`}>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">{step.title}</h3>
                <div className="p-5 md:p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 w-full text-left">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )})}
        </div>

        {/* Trust/Security Cards */}
        <div className="mt-20 md:mt-32 mb-12 md:mb-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Built for Privacy</h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Everything stays within your control. We don't act as a middleman.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 md:p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-green-500 mb-3 md:mb-4" />
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base md:text-lg">No Databases</h4>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">We don't store your API keys or conversation history on our servers. Everything relies on your browser's local storage.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-5 md:p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-500 mb-3 md:mb-4" />
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base md:text-lg">Direct Connections</h4>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">The application fetches responses directly from the AI providers. Your prompts never route through our backend.</p>
            </motion.div>
            
           </div>
        </div>

      </div>
      
      <Footer />
    </main>
  );
}
