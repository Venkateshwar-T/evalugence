import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { providerId, apiKey } = await request.json();

    if (!providerId || !apiKey) {
      return NextResponse.json({ success: false, error: 'Provider ID and API Key are required' }, { status: 400 });
    }

    let models: string[] = [];

    switch (providerId) {
      case 'openai':
        const openaiRes = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!openaiRes.ok) throw new Error('Invalid OpenAI API Key');
        const openaiData = await openaiRes.json();
        models = openaiData.data
          .filter((m: any) => m.id.includes('gpt') || m.id.startsWith('o1') || m.id.startsWith('o3'))
          .map((m: any) => m.id)
          .sort();
        break;

      case 'google':
        const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!googleRes.ok) throw new Error('Invalid Google API Key');
        const googleData = await googleRes.json();
        const googleValidModels = googleData.models.filter((m: any) => (m.name.includes('gemini') || m.name.includes('gemma')) && !m.name.includes('embedding') && !m.name.includes('aqa'));
        models = googleValidModels.map((m: any) => m.name.replace('models/', '')).sort();
        break;

      case 'anthropic':
        // Anthropic requires specific headers. We test by making a minimal request.
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        if (anthropicRes.status === 401) throw new Error('Invalid Anthropic API Key');
        // If it's valid (200 or even 400 for other reasons but not 401), we return hardcoded models since there's no official models endpoint
        models = ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"];
        break;

      case 'mistral':
        const mistralRes = await fetch('https://api.mistral.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!mistralRes.ok) throw new Error('Invalid Mistral API Key');
        const mistralData = await mistralRes.json();
        models = mistralData.data.map((m: any) => m.id).sort();
        break;

      case 'deepseek':
        const deepseekRes = await fetch('https://api.deepseek.com/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!deepseekRes.ok) throw new Error('Invalid DeepSeek API Key');
        const deepseekData = await deepseekRes.json();
        models = deepseekData.data.map((m: any) => m.id).sort();
        break;

      case 'openrouter':
        const openrouterRes = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!openrouterRes.ok) throw new Error('Invalid OpenRouter API Key');
        const openrouterData = await openrouterRes.json();
        models = openrouterData.data.map((m: any) => m.id).sort();
        break;

      case 'nvidia':
        const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!nvidiaRes.ok) throw new Error('Invalid Nvidia API Key');
        const nvidiaData = await nvidiaRes.json();
        models = nvidiaData.data.map((m: any) => m.id).sort();
        break;

      default:
        throw new Error('Unsupported provider');
    }

    return NextResponse.json({ success: true, models });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to connect to provider' }, { status: 400 });
  }
}
