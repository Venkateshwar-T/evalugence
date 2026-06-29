import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const messages = payload.messages;
    const dataObj = Array.isArray(payload.data) ? payload.data[0] : payload.data || {};
    const providerId = payload.providerId || dataObj.providerId || req.headers.get('x-provider-id');
    const modelName = payload.modelName || dataObj.modelName || req.headers.get('x-model-name');
    const apiKey = payload.apiKey || dataObj.apiKey || req.headers.get('x-api-key');

    if (!apiKey) {
      return new Response("No API key provided. Please connect your API key in the configuration panel.", { 
        status: 401,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    let model;

    switch (providerId) {
      case 'openai': {
        const openai = createOpenAI({ apiKey });
        model = openai(modelName);
        break;
      }
      case 'google': {
        const google = createGoogleGenerativeAI({ apiKey });
        model = google(modelName);
        break;
      }
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey });
        model = anthropic(modelName);
        break;
      }
      case 'mistral': {
        const mistral = createMistral({ apiKey });
        model = mistral(modelName);
        break;
      }
      case 'deepseek': {
        const deepseek = createOpenAI({ apiKey, baseURL: 'https://api.deepseek.com/v1' });
        model = deepseek.chat(modelName);
        break;
      }
      case 'openrouter': {
        const openrouter = createOpenRouter({ 
          apiKey,
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        model = openrouter.chat(modelName);
        break;
      }
      case 'nvidia': {
        const nvidia = createOpenAI({ apiKey, baseURL: 'https://integrate.api.nvidia.com/v1' });
        model = nvidia.chat(modelName);
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unsupported provider" }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    let startIndex = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'data' && messages[i].content?.includes('Model switched')) {
        startIndex = i + 1;
        break;
      }
    }

    const coreMessages = messages.slice(startIndex)
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => {
        let text = typeof msg.content === 'string' ? msg.content : (msg.text || '');
        if (!text && msg.parts) {
          text = msg.parts.map((p: any) => p.text || p.content || '').join('');
        }

        return { role: msg.role, content: text };
      });

    const configHeader = req.headers.get('x-config');
    const headerConfig = configHeader ? JSON.parse(configHeader) : {};
    const config = payload.config || dataObj.config || headerConfig;
    let systemPrompt = config.systemPrompt || payload.system || dataObj.system || '';

    // Handle session memory setting
    const useMemory = config.memory !== false;
    let finalMessages = coreMessages;
    if (!useMemory && coreMessages.length > 0) {
      finalMessages = [coreMessages[coreMessages.length - 1]];
    }

    // No default system prompt is injected anymore

    const streamOptions: any = {
      model,
      messages: finalMessages,
      system: systemPrompt
    };

    if (config.parameters) {
      if (config.parameters.temperature !== undefined) streamOptions.temperature = config.parameters.temperature;
      if (config.parameters.max_tokens !== undefined) streamOptions.maxTokens = config.parameters.max_tokens;
      if (config.parameters.top_p !== undefined) streamOptions.topP = config.parameters.top_p;
      if (config.parameters.frequency_penalty !== undefined) streamOptions.frequencyPenalty = config.parameters.frequency_penalty;
      if (config.parameters.presence_penalty !== undefined) streamOptions.presencePenalty = config.parameters.presence_penalty;
      if (config.parameters.seed !== undefined) streamOptions.seed = config.parameters.seed;
      if (config.parameters.stop) {
        streamOptions.stopSequences = config.parameters.stop.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      
      // Some provider specific params like top_k, min_p, etc. might need providerOptions or are handled by the provider if passed in
      streamOptions.providerOptions = {
        openai: {
          reasoningEffort: config.parameters.reasoning_effort,
          ...config.parameters
        },
        openrouter: {
          include_reasoning: config.parameters.include_reasoning,
          ...config.parameters
        }
      };
    }

    const result = streamText(streamOptions);

    return result.toUIMessageStreamResponse({ 
      sendUsage: true, 
      sendFinish: true,
      getErrorMessage: (err: any) => {
        if (err == null) return 'unknown error';
        if (typeof err === 'string') return err;
        if (err.lastError?.message) return err.lastError.message;
        if (err.message) return err.message;
        return JSON.stringify(err);
      }
    } as any);
  } catch (error: any) {
    let errorMessage = error.message || "An error occurred";
    if (error.lastError && error.lastError.message) {
      errorMessage = error.lastError.message;
    } else if (error.errors && error.errors.length > 0 && error.errors[0].message) {
      errorMessage = error.errors[0].message;
    }

    return new Response(errorMessage, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
