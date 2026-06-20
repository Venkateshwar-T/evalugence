import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';

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
        const openrouter = createOpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' });
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

        const attachments = msg.experimental_attachments || [];
        if (attachments.length > 0) {
          const contentParts: any[] = [];
          if (text) contentParts.push({ type: 'text', text });
          
          attachments.forEach((att: any) => {
            if (att.contentType?.startsWith('image/')) {
              contentParts.push({ type: 'image', image: att.url });
            } else {
              contentParts.push({ type: 'file', mimeType: att.contentType, data: att.url });
            }
          });
          return { role: msg.role, content: contentParts };
        }

        return { role: msg.role, content: text };
      });

    const configHeader = req.headers.get('x-config');
    const headerConfig = configHeader ? JSON.parse(configHeader) : {};
    const config = payload.config || dataObj.config || headerConfig;
    let systemPrompt = config.systemPrompt || payload.system || dataObj.system || '';

    // Implicitly inform the model of its exact name behind the scenes
    const modelIdentityString = `[System Note: You are currently instantiated as the model named "${modelName}". Always identify yourself exactly as this when asked.]`;
    systemPrompt = systemPrompt ? `${modelIdentityString}\n\n${systemPrompt}` : modelIdentityString;

    const streamOptions: any = {
      model,
      messages: coreMessages,
      system: systemPrompt
    };

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
