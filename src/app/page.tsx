import BrandLogoAnimation from "@/components/BrandLogoAnimation";
import HeroSection from "@/components/landing/HeroSection";
import SupportedModels from "@/components/landing/SupportedModels";
import TrustModelSection from "@/components/landing/TrustModelSection";
import TheFlowSection from "@/components/landing/TheFlowSection";
import YourPlaygroundSection from "@/components/landing/YourPlaygroundSection";
import Footer from "@/components/landing/Footer";

export default function Home() {

  return (
    <main className="flex-1 flex flex-col w-full relative">
      {/* Background glow container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[60vw] max-w-[800px] h-[800px] bg-blue-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] left-[-10%] w-[60vw] max-w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60vw] max-w-[600px] h-[600px] bg-green-500/10 blur-[150px] rounded-full" />
      </div>
      
      <HeroSection />
      <SupportedModels />
      <TrustModelSection />
      <TheFlowSection />
      <YourPlaygroundSection />
      
      {/* Brand Logo Animation just before footer */}
      <div className="w-full flex justify-center items-center py-20 md:py-32 border-t border-gray-200 dark:border-gray-800 relative z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm overflow-hidden">
        <BrandLogoAnimation />
      </div>

      <Footer />
    </main>
  );
}
