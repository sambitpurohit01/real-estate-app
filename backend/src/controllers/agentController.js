const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const llmClient = require('../services/llmClient');
const { toolDefs, runTool } = require('../services/agentTools');

const SYSTEM_PROMPT = `You are the Keystone Assistant, a helpful real-estate agent embedded in the Keystone property listing app.

You can search listings, look up details on a specific listing, send a contact message to a listing owner, and save listings to favorites — using the tools provided. Always use a tool to get real data or take a real action; never invent prices, addresses, or availability.

Rules:
- Keep replies short and conversational (2-4 sentences), like a helpful agent texting a client — not a report.
- When you call search_properties or get_property_details, the app will show the actual listing cards to the user, so don't re-describe every field in text — just summarize briefly ("Found 4 apartments in Pune under 50L, here you go") and let the cards speak.
- Before calling submit_inquiry, make sure you have the user's name, email, and a message — ask if anything is missing. Confirm before sending.
- Before calling add_favorite or list_favorites, if you don't know whether the user is logged in, just try the tool — it will tell you if they need to log in first.
- If a tool returns an error, explain it plainly to the user and suggest what to do next.
- Never claim to have done something (saved, sent, found) unless a tool call actually succeeded.`;

const MAX_TOOL_ROUNDS = 4;

const chat = asyncHandler(async (req, res) => {
  if (String(process.env.AGENT_ENABLED).toLowerCase() !== 'true') {
    throw new AppError('The AI agent is disabled on this server.', 503);
  }
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') throw new AppError('message is required', 400);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(Array.isArray(history) ? history.slice(-16) : []),
    { role: 'user', content: message },
  ];

  const ctx = { user: req.user || null };
  const collectedProperties = new Map(); // dedupe by id across multiple tool calls
  const collectedActions = [];

  let rounds = 0;
  let finalMessage;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds += 1;
    const assistantMessage = await llmClient.chat({ messages, tools: toolDefs });
    messages.push(assistantMessage);

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      finalMessage = assistantMessage.content || '';
      break;
    }

    for (const call of assistantMessage.tool_calls) {
      let args = {};
      try { args = JSON.parse(call.function.arguments || '{}'); } catch (e) { /* ignore */ }

      const { result, properties, actions } = await runTool(call.function.name, args, ctx);

      if (properties) properties.forEach((p) => collectedProperties.set(p.id, p));
      if (actions) collectedActions.push(...actions);

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  if (finalMessage === undefined) {
    finalMessage = "I wasn't able to finish that — could you try rephrasing, or ask me one thing at a time?";
  }

  res.json({
    reply: finalMessage,
    properties: Array.from(collectedProperties.values()),
    actions: collectedActions,
  });
});

module.exports = { chat };
