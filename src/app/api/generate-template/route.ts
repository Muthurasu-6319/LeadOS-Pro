import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { industry, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API Key is required. Please add it in Integrations.' }, { status: 400 });
    }

    const prompt = `You are an expert cold email copywriter and business analyst. 
Analyze the common problems and pain points faced by businesses in the "${industry}" industry.
Then, write a highly effective, personalized cold email template aimed at solving these problems.

The output MUST be a JSON object with exactly two keys:
1. "subject": A catchy, professional subject line.
2. "body": The email body text. Use placeholders like [Name], [Company], [City] where appropriate.

Keep the tone professional yet conversational. Focus on one or two specific pain points.
DO NOT include any other text besides the JSON object.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://leadfinder.io', // Required by OpenRouter
        'X-Title': 'Lead Finder', // Optional but good practice
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // Fast and cheap default for OpenRouter
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const content = JSON.parse(data.choices[0].message.content);
    return NextResponse.json({ success: true, data: content });

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate template: ' + error.message }, { status: 500 });
  }
}
