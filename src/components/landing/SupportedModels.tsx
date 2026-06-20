'use client';

import { motion } from 'framer-motion';

const providers = [
  { name: 'OpenAI', src: '/brands/OpenAI.png' },
  { name: 'Anthropic', src: '/brands/Anthropic.png' },
  { name: 'Google', src: '/brands/google.png' },
  { name: 'DeepSeek', src: '/brands/deepseek.png', customClass: 'scale-[1.25]' },
  { name: 'Mistral', src: '/brands/mistral-ai.png', customClass: 'scale-[1.25]' },
  { name: 'Nvidia', src: '/brands/nvidia.png' },
  { name: 'Open Router', src: '/brands/open-router.png', customClass: 'scale-[1.25]' },
  { name: 'Meta', src: '/brands/meta.png' },
];

export default function SupportedModels() {
  // Duplicate for seamless infinite scroll (2 sets)
  const duplicatedProviders = [...providers, ...providers];

  return (
    <section className="py-12 bg-white dark:bg-black border-y border-gray-200 dark:border-gray-800 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-6 lg:px-8 mb-8"
      >
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Connect Models From Anywhere
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Bring your own API keys and compare models in one place.
          </p>
        </div>
      </motion.div>
      
      <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[100px] before:bg-gradient-to-r before:from-white dark:before:from-black before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-[100px] after:bg-gradient-to-l after:from-white dark:after:from-black after:to-transparent">
        <div className="flex w-max animate-marquee items-center">
          {duplicatedProviders.map((provider, idx) => (
            <div 
              key={`${provider.name}-${idx}`}
              className="mx-2 md:mx-4 flex items-center justify-center transition-all duration-300 w-28 h-12 md:w-40 md:h-16 relative bg-gray-100 dark:bg-white rounded-xl md:rounded-2xl border border-gray-200 dark:border-white px-4 md:px-6"
            >
              <img 
                src={provider.src} 
                alt={provider.name} 
                className={`max-h-full max-w-full object-contain ${provider.customClass || ''}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
