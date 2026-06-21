import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-4 md:py-12 bg-white dark:bg-black border-t border-gray-300 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="font-bold tracking-widest text-lg text-gray-900 dark:text-white uppercase">
          Evalugence
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link href="/features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
          <Link href="/how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How it works</Link>
          <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link>
        </div>
        
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Evalugence.
        </div>
      </div>
    </footer>
  );
}
