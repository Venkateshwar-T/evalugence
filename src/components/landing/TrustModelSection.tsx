import { ArrowRight } from 'lucide-react';

export default function TrustModelSection() {
  const points = [
    {
      title: "Securely stored locally.",
      desc: "Keys are securely stored in your browser's local storage and are never saved to our database."
    },
    {
      title: "Minimal Serverless Proxy.",
      desc: "Requests pass through our minimal API routes to handle CORS, without any prompts or keys being logged or intercepted."
    },
    {
      title: "No prompt logging by default.",
      desc: "We don't keep a copy of what you send or what comes back unless you explicitly turn on history."
    },
    {
      title: "Disconnect anytime.",
      desc: "Remove a key and it's gone from your browser immediately — there's nothing left on our side to delete."
    }
  ];

  return (
    <section className="w-full py-24 bg-gray-50 dark:bg-[#050505] border-y border-gray-200 dark:border-gray-800 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-[800px] h-[300px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 block">
            THE TRUST MODEL
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Your key stays yours
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            We're not asking you to trust a badge on a page. Here's exactly what happens from the moment you paste a key.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {points.map((point, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="mt-1">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm border border-green-200 dark:border-green-800/50 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4 stroke-[3px]" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{point.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  {point.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
