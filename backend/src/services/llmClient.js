// Thin wrapper around the LLM provider so the rest of the agent code never
// touches a provider-specific SDK directly. To swap providers again later,
// you only need to rewrite this file — keep the same `chat({ messages, tools })`
// -> assistant message contract and nothing in src/services/agentTools.js or
// src/controllers/agentController.js needs to change.
//
// Wired here: Google Gemini (free tier, no credit card required). Get a key
// at https://aistudio.google.com/apikey and set GEMINI_API_KEY in backend/.env.
//
// Internally we still speak the OpenAI-style message shape everywhere else in
// this codebase ({ role, content, tool_calls }) and convert to/from Gemini's
// `contents` format only in this file, so the rest of the agent is provider-agnostic.

const { GoogleGenAI } = require('@google/genai');

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set — add it to backend/.env to enable the AI agent. Get a free key at https://aistudio.google.com/apikey');
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Gemini's function-declaration schema expects JSON Schema `type` values in
// upper case ("OBJECT", "STRING", ...) — our tool defs are written in normal
// lower-case JSON Schema, so we upper-case them recursively here.
function upperType(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  if (Array.isArray(schema)) return schema.map(upperType);
  const out = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'type' && typeof value === 'string') {
      out[key] = value.toUpperCase();
    } else if (key === 'properties' && value && typeof value === 'object') {
      out[key] = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, upperType(v)]));
    } else if (key === 'items') {
      out[key] = upperType(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function toGeminiTools(openAiTools) {
  if (!openAiTools || !openAiTools.length) return undefined;
  return [{
    functionDeclarations: openAiTools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      parameters: upperType(t.function.parameters),
    })),
  }];
}

// Converts our OpenAI-style messages array (system/user/assistant/tool) into
// Gemini's { systemInstruction, contents } shape. Consecutive tool-call
// requests/results are grouped into a single turn, matching how Gemini
// expects parallel function calls and their responses to be batched.
function toGeminiPayload(messages) {
  let systemInstruction = '';
  const contents = [];
  const callIdToName = new Map();
  let i = 0;

  while (i < messages.length) {
    const m = messages[i];

    if (m.role === 'system') {
      systemInstruction = systemInstruction ? `${systemInstruction}\n${m.content}` : m.content;
      i += 1;
      continue;
    }

    if (m.role === 'user') {
      contents.push({ role: 'user', parts: [{ text: m.content || '' }] });
      i += 1;
      continue;
    }

    if (m.role === 'assistant') {
      if (m.tool_calls && m.tool_calls.length) {
        const parts = m.tool_calls.map((tc) => {
          callIdToName.set(tc.id, tc.function.name);
          let args = {};
          try { args = JSON.parse(tc.function.arguments || '{}'); } catch (e) { /* leave empty */ }
          const part = { functionCall: { name: tc.function.name, args } };
          // Gemini 3 requires the exact thoughtSignature it issued for this
          // functionCall to be echoed back on the next turn, or it 400s.
          if (tc._thoughtSignature) part.thoughtSignature = tc._thoughtSignature;
          return part;
        });
        contents.push({ role: 'model', parts });
      } else {
        contents.push({ role: 'model', parts: [{ text: m.content || '' }] });
      }
      i += 1;
      continue;
    }

    if (m.role === 'tool') {
      const parts = [];
      while (i < messages.length && messages[i].role === 'tool') {
        const tm = messages[i];
        const name = callIdToName.get(tm.tool_call_id) || 'unknown_function';
        let responseObj;
        try { responseObj = JSON.parse(tm.content); } catch (e) { responseObj = { result: tm.content }; }
        parts.push({ functionResponse: { name, response: responseObj } });
        i += 1;
      }
      contents.push({ role: 'user', parts });
      continue;
    }

    i += 1; // unknown role — skip
  }

  return { systemInstruction, contents };
}

// messages: OpenAI-style chat messages array (system/user/assistant/tool)
// tools: OpenAI-style tools array ([{ type: 'function', function: {...} }])
// Returns a normalized assistant message: { role: 'assistant', content, tool_calls? }
async function chat({ messages, tools }) {
  const ai = getClient();
  const { systemInstruction, contents } = toGeminiPayload(messages);
  const geminiTools = toGeminiTools(tools);

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    contents,
    config: {
      ...(systemInstruction ? { systemInstruction } : {}),
      ...(geminiTools ? { tools: geminiTools } : {}),
      temperature: 0.3,
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const text = parts.filter((p) => p.text).map((p) => p.text).join('');
  const functionCallParts = parts.filter((p) => p.functionCall);

  if (functionCallParts.length > 0) {
    return {
      role: 'assistant',
      content: text || null,
      tool_calls: functionCallParts.map((p, idx) => ({
        id: `call_${Date.now()}_${idx}`,
        type: 'function',
        function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args || {}) },
        // Carried through so it can be echoed back verbatim next turn (see toGeminiPayload above).
        // Not part of the "public" tool_call shape — agentController/agentTools never read it.
        _thoughtSignature: p.thoughtSignature,
      })),
    };
  }

  return { role: 'assistant', content: text };
}

module.exports = { chat };
