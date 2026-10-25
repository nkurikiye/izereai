const CURRICULUM_VERSION = '2026-10-25.2';

const ACTIVITY = {
  id: 'money:foundations',
  concepts: ['saving', 'inflation', 'compound growth', 'diversification', 'risk', 'asset classes'],
  summary: 'Saving protects money for near-term needs, while investing accepts uncertainty in pursuit of longer-term growth. Inflation can reduce the purchasing power of cash over time; compounding means returns can build on earlier returns; and diversification spreads exposure so one outcome has less influence on the whole.',
  learningObjectives: [
    'Match saving and investing to different time horizons',
    'Explain inflation and compounding without treating returns as guaranteed',
    'Describe how diversification changes concentration risk'
  ],
  misconceptions: [
    'Cash is risk-free in purchasing-power terms',
    'Compound growth guarantees a specific result',
    'Diversification prevents losses',
    'One asset class is best for everyone'
  ],
  coachPrompt: 'Explain foundational money concepts in plain language, keep uncertainty visible and never recommend a product or personal allocation.',
  sourceIds: ['IZERE-CURR-MONEY-FOUNDATIONS-01']
};

const ADVICE_PATTERNS = [
  /\b(buy|sell|hold)\b.{0,35}\b(stock|share|etf|fund|crypto|bond|investment)\b/i,
  /\b(which|what)\b.{0,25}\b(stock|share|etf|fund|crypto|bond)\b.{0,20}\b(choose|buy|invest)/i,
  /\brecommend(?:ation)?\b.{0,35}\b(stock|share|etf|fund|portfolio|investment)/i,
  /\bshould i\b.{0,35}\b(buy|sell|invest|hold|borrow)\b/i,
  /\bis\b.{0,35}\ba good investment\b/i,
  /\b(build|make|design)\b.{0,20}\bmy portfolio\b/i,
  /\bhow much\b.{0,30}\b(should i|to)\b.{0,20}\binvest/i,
  /\bguarantee(?:d)?\b.{0,25}\b(return|profit|income|gain)/i,
  /\bmy\b.{0,20}\b(tax|legal|portfolio|pension|mortgage|debt)\b.{0,25}\b(advice|strategy|situation|case)/i
];

const COACH_SCHEMA = {
  type: 'object',
  properties: {
    mood: { type: 'string', enum: ['explaining', 'thinking', 'caution', 'celebrating'] },
    title: { type: 'string' },
    message: { type: 'string' },
    followUp: { type: 'string' },
    concepts: { type: 'array', items: { type: 'string' } },
    sourceIds: { type: 'array', items: { type: 'string' } },
    boundary: { type: 'string', enum: ['education', 'redirected'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
  },
  required: ['mood', 'title', 'message', 'followUp', 'concepts', 'sourceIds', 'boundary', 'confidence'],
  additionalProperties: false
};

function cleanText(value, maximum = 400) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximum);
}

function isAdviceRequest(question) {
  return ADVICE_PATTERNS.some((pattern) => pattern.test(cleanText(question)));
}

function redirectedResponse() {
  return {
    mood: 'caution',
    title: 'Let’s keep this educational.',
    message: 'I can explain how investment choices, diversification and risk work, but I cannot recommend what you should buy, sell or hold—or decide what is suitable for your personal situation.',
    followUp: 'Would you like to compare the concepts or trade-offs using a fictional example?',
    concepts: ACTIVITY.concepts.slice(0, 3),
    sourceIds: ACTIVITY.sourceIds,
    boundary: 'redirected',
    confidence: 'high'
  };
}

function controlledResponse() {
  return {
    mood: 'explaining',
    title: 'Start with the underlying idea.',
    message: ACTIVITY.summary,
    followUp: `Can you apply this test: ${ACTIVITY.learningObjectives[0].toLowerCase()}?`,
    concepts: ACTIVITY.concepts.slice(0, 3),
    sourceIds: ACTIVITY.sourceIds,
    boundary: 'education',
    confidence: 'high'
  };
}

function validResponse(candidate) {
  if (!candidate || typeof candidate !== 'object') return false;
  if (!['explaining', 'thinking', 'caution', 'celebrating'].includes(candidate.mood)) return false;
  if (candidate.boundary !== 'education' || !['high', 'medium', 'low'].includes(candidate.confidence)) return false;
  if (![candidate.title, candidate.message, candidate.followUp].every((value) => typeof value === 'string' && value.trim())) return false;
  if (candidate.message.length > 900 || candidate.followUp.length > 300 || candidate.title.length > 120) return false;
  if (!Array.isArray(candidate.sourceIds) || !candidate.sourceIds.every((sourceId) => ACTIVITY.sourceIds.includes(sourceId))) return false;
  return !isAdviceRequest(`${candidate.title} ${candidate.message} ${candidate.followUp}`);
}

function outputText(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text;
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }
  return '';
}

async function adaptiveResponse({ question, locale }) {
  const apiKey = globalThis.Netlify?.env.get('OPENAI_API_KEY');
  const model = globalThis.Netlify?.env.get('OPENAI_MODEL');
  if (!apiKey || !model) return null;

  const providerResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [{
            type: 'input_text',
            text: `You are Bakame, Izere’s calm financial-literacy coach. Use only the supplied curriculum. Explain concepts in under 120 words. Never recommend a real product, transaction, allocation, tax position or legal action. Never promise returns. Keep uncertainty visible. Return only the required JSON. Approved curriculum: ${JSON.stringify(ACTIVITY)}`
          }]
        },
        { role: 'user', content: [{ type: 'input_text', text: JSON.stringify({ question, locale }) }] }
      ],
      text: { format: { type: 'json_schema', name: 'bakame_coach_response', strict: true, schema: COACH_SCHEMA } },
      max_output_tokens: 500
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!providerResponse.ok) throw new Error(`AI provider returned ${providerResponse.status}.`);
  const candidate = JSON.parse(outputText(await providerResponse.json()));
  return validResponse(candidate) ? candidate : null;
}

function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'",
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (Number(request.headers.get('content-length') || 0) > 4096) return json({ error: 'Request is too large.' }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Send a valid JSON question.' }, 400);
  }

  if (cleanText(body?.activityId, 80) !== ACTIVITY.id) return json({ error: 'This learning activity is not available to Bakame.' }, 404);
  const question = cleanText(body?.question);
  if (question.length < 2) return json({ error: 'Ask Bakame a short learning question.' }, 400);

  if (isAdviceRequest(question)) {
    return json({ response: redirectedResponse(), provider: 'policy', curriculumVersion: CURRICULUM_VERSION });
  }

  try {
    const response = await adaptiveResponse({ question, locale: cleanText(body?.locale, 12) || 'en' });
    if (response) return json({ response, provider: 'openai', curriculumVersion: CURRICULUM_VERSION });
  } catch (error) {
    console.warn(`Bakame AI fallback: ${error.message}`);
  }

  return json({ response: controlledResponse(), provider: 'controlled-preview', curriculumVersion: CURRICULUM_VERSION });
}

export const config = {
  path: '/api/coach/respond',
  method: 'POST',
  rateLimit: { action: 'rate_limit', aggregateBy: 'ip', windowSize: 60, windowLimit: 30 }
};

export { controlledResponse, isAdviceRequest };
