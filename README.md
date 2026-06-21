# Evalugence

Evalugence is a high-performance, Bring-Your-Own-Key (BYOK) AI evaluation workspace. Designed for developers, researchers, and prompt engineers, it allows you to test, compare, and benchmark bleeding-edge Large Language Models (LLMs) side-by-side in real time.

## 🚀 Key Features

* **Side-by-Side Comparison:** Test identical prompts against up to 5 different AI models simultaneously to evaluate reasoning capability, output quality, and latency.
* **Deep Evaluation Metrics:** Gain transparent insights into model performance with real-time tracking of Time-To-First-Token (TTFT), raw generation speed (Tokens per Second), and context length.
* **Bring Your Own Key (BYOK) Architecture:** Evalugence prioritizes your security. API keys are strictly stored on your local machine using client-side persistent storage. Requests are routed through a secure backend proxy to bypass CORS restrictions without ever logging, caching, or exposing your keys.
* **Broad Provider Support:** Connect natively to leading LLM providers (OpenAI, Anthropic, Google, DeepMind) or leverage aggregator services (like OpenRouter, Together AI, or Groq) to access hundreds of open-source models instantly.
* **Custom System Prompts:** Shape model behavior dynamically using granular global system prompts to ensure apples-to-apples evaluations.

## 🔒 Privacy & Security First

Evalugence operates on a strict zero-trust model regarding your data:
- **Zero Server Storage:** Your API keys, chat history, and preferences never touch a remote database.
- **Volatile Key Mode:** Enable auto-deletion in Settings to ensure your API keys are securely wiped from your device the moment you close your browser tab—perfect for shared environments.
- **Local Dashboard Analytics:** Your evaluation metrics and historical session data are securely constructed from your browser's local state.


## 🧠 Usage Workflow

1. **Connect Providers:** Navigate to the **Models** page and connect your preferred AI providers by supplying an API key.
2. **Enter the Lab:** Open the **Lab** workspace to begin interacting with your models.
3. **Benchmark:** Toggle to **Compare Models** mode, select the specific models you wish to benchmark, and fire a prompt.
4. **Monitor Performance:** Open the **Evaluation Metrics** side menu to monitor TTFT and Token Speed in real-time as the models stream their responses.
5. **Review Analytics:** Check your **Dashboard** to review aggregate data and discover which models consistently perform fastest for your specific workloads.

---

*Built for the future of multi-model AI development.*
