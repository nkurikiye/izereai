import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { controlledResponse, isAdviceRequest } from '../netlify/functions/bakame-coach.mjs';

test('returns a curriculum-grounded public preview response', async () => {
  const request = new Request('https://izereai.com/api/coach/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId: 'money:foundations', question: 'Why does diversification matter?' })
  });
  const response = await handler(request);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.provider, 'controlled-preview');
  assert.deepEqual(payload.response.sourceIds, ['IZERE-CURR-MONEY-FOUNDATIONS-01']);
  assert.match(payload.response.message, /diversification/i);
});

test('redirects requests for a product recommendation', async () => {
  const request = new Request('https://izereai.com/api/coach/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId: 'money:foundations', question: 'Which ETF should I buy?' })
  });
  const response = await handler(request);
  const payload = await response.json();

  assert.equal(isAdviceRequest('Which ETF should I buy?'), true);
  assert.equal(payload.provider, 'policy');
  assert.equal(payload.response.boundary, 'redirected');
});

test('rejects unknown activities and keeps the fallback educational', async () => {
  const request = new Request('https://izereai.com/api/coach/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId: 'unknown', question: 'Explain risk.' })
  });
  const response = await handler(request);

  assert.equal(response.status, 404);
  assert.equal(controlledResponse().boundary, 'education');
});
