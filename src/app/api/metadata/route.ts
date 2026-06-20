import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { providerId, apiKey, modelName } = await request.json();

    if (!providerId || !apiKey || !modelName) {
      return NextResponse.json({ success: false, error: 'Provider ID, API Key, and Model Name are required' }, { status: 400 });
    }

    let url = '';
    let headers: any = {};
    
    switch (providerId) {
      case 'openai': url = 'https://api.openai.com/v1/models'; headers = { 'Authorization': `Bearer ${apiKey}` }; break;
      case 'openrouter': url = 'https://openrouter.ai/api/v1/models'; break;
      case 'deepseek': url = 'https://api.deepseek.com/models'; headers = { 'Authorization': `Bearer ${apiKey}` }; break;
      case 'mistral': url = 'https://api.mistral.ai/v1/models'; headers = { 'Authorization': `Bearer ${apiKey}` }; break;
      case 'nvidia': url = 'https://integrate.api.nvidia.com/v1/models'; headers = { 'Authorization': `Bearer ${apiKey}` }; break;
      case 'google': url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`; break;
      case 'anthropic': 
        // Anthropic doesn't have a public models endpoint, so we return a placeholder metadata object
        return NextResponse.json({ 
          success: true, 
          metadata: { 
            id: modelName, 
            name: modelName,
            provider: 'anthropic',
            note: 'Anthropic does not expose a public models API endpoint. This is a placeholder.'
          } 
        });
      default:
        throw new Error('Unsupported provider');
    }

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Failed to fetch from provider API');
    const data = await res.json();
    
    let modelData = data;
    if (data.data && Array.isArray(data.data)) {
      modelData = data.data.find((m: any) => m.id === modelName || m.name === modelName) || data;
    } else if (data.models && Array.isArray(data.models)) {
      modelData = data.models.find((m: any) => m.name === `models/${modelName}` || m.name === modelName) || data;
    }

    return NextResponse.json({ success: true, metadata: modelData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch metadata' }, { status: 400 });
  }
}
