# Evalugence | AI Evaluation Lab

Evalugence is a high-performance, Bring-Your-Own-Key (BYOK) workspace that lets you test, compare, and analyze AI models side-by-side in real time.

## Fast Facts
- **Multi-Model Testing:** Fire a single prompt to up to 5 models at once and watch them stream back simultaneously.
- **Real-Time Telemetry:** Instantly see Time-To-First-Token (TTFT) and raw token generation speed (Tokens/Second) to identify the fastest models.
- **Provider Agnostic:** Connect directly to OpenAI, Anthropic, Google, Mistral, xAI, or OpenRouter. Everything works through one unified interface.
- **Dynamic Configuration:** Adjust system prompts, max tokens, temperature, and even reasoning effort for advanced o1/o3 models per provider. 

## 100% Local, Zero-Trust Privacy
Your data never touches a remote server database:
- **Local Storage Only:** API keys and chat history are saved exclusively to your browser's local storage or IndexedDB.
- **Direct Proxying:** Requests are routed through a stateless Next.js backend purely to bypass browser CORS restrictions. Keys are never logged, cached, or saved.
- **Volatile Mode:** An optional setting ensures your keys are instantly wiped the moment you close the browser tab.

## Quick Start
1. **Connect:** Go to Settings and enter your API keys for the providers you want to use.
2. **Chat or Compare:** Enter the Lab. You can chat one-on-one, or toggle "Compare Mode" to test multiple models against each other.
3. **Analyze:** Check the Dashboard to review your historical request latency and average token speeds.

*Built for speed, transparency, and multi-model workflows.*
