import Footer from '@/components/landing/Footer';
import { Shield, Lock, ServerOff, Database, EyeOff } from 'lucide-react';

export default function PrivacyPolicy() {
  const policies = [
    {
      icon: Lock,
      title: "Local-First Architecture",
      description: "Evalugence is designed as a local-first application. This means the core logic runs directly within your browser. We do not host a centralized database to store your sensitive information."
    },
    {
      icon: Shield,
      title: "API Key Security",
      description: "When you provide API keys for providers like OpenAI or Anthropic, they are stored securely and solely in your browser's LocalStorage. They are transmitted to our serverless API endpoints only at the moment of execution to authorize your prompt."
    },
    {
      icon: ServerOff,
      title: "Minimal Serverless Routing",
      description: "Due to browser security restrictions (CORS), your prompts route through our minimal serverless API functions to communicate with the AI providers. These functions act purely as a pass-through proxy. We do not log, intercept, or save any of your prompts, API keys, or AI responses on our servers."
    },
    {
      icon: Database,
      title: "Chat History & Sessions",
      description: "Any chat history or saved sessions are stored locally on your device using IndexedDB. We do not have access to your chat logs, test results, or prompt templates."
    },
    {
      icon: EyeOff,
      title: "No Tracking or Telemetry",
      description: "We respect your privacy. We do not embed hidden tracking pixels, invasive analytics, or telemetry scripts that monitor your behavior or read your prompt contents."
    }
  ];

  return (
    <main className="flex-1 flex flex-col w-full min-h-screen relative">
      {/* Background glow container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-[800px] h-[400px] bg-green-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 md:mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            At Evalugence, we believe that your data—especially your prompts and API keys—belongs to you. Our privacy policy is simple: <strong className="text-gray-900 dark:text-white font-bold">we don't collect your data.</strong>
          </p>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-12 md:mb-20">
          {policies.map((policy, idx) => (
            <div key={idx} className="p-5 md:p-8 bg-gray-50/50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl md:rounded-3xl hover:shadow-md transition-shadow">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-4 md:mb-6 shadow-sm">
                <policy.icon className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                {policy.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-[15px]">
                {policy.description}
              </p>
            </div>
          ))}
        </div>

        {/* Third Party Section */}
        <div className="p-6 md:p-10 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl md:rounded-3xl">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Third-Party Providers</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            While Evalugence does not store or analyze your data, you are interacting with third-party API providers (such as OpenAI, Anthropic, Google, etc.). When you submit a prompt, your data is governed by the respective privacy policy and terms of service of the provider you are using.
          </p>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Please ensure you review how these providers handle API data before using their services through Evalugence.
          </p>
        </div>

      </div>

      <Footer />
    </main>
  );
}
