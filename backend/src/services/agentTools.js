// Defines what the AI agent is allowed to do, and how each tool call maps
// onto the SAME service functions the REST API uses (propertyService,
// favoriteService, inquiryService) — so the agent can never do anything a
// human user couldn't also do through the normal app, and ownership/auth
// rules are enforced exactly once, in one place.

const propertyService = require('./propertyService');
const favoriteService = require('./favoriteService');
const inquiryService = require('./inquiryService');
const AppError = require('../utils/AppError');

// --- OpenAI "tools" schema -------------------------------------------------

const toolDefs = [
  {
    type: 'function',
    function: {
      name: 'search_properties',
      description: 'Search property listings by city, state, type, price range, bedrooms, or free-text keyword. Use this whenever the user describes what kind of place they want.',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name, e.g. "Pune"' },
          state: { type: 'string', description: 'State name, e.g. "Maharashtra"' },
          propertyType: { type: 'string', enum: ['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL'] },
          listingType: { type: 'string', enum: ['SALE', 'RENT'], description: 'Whether the user wants to buy (SALE) or rent (RENT)' },
          minPrice: { type: 'number' },
          maxPrice: { type: 'number' },
          minBedrooms: { type: 'integer' },
          keyword: { type: 'string', description: 'Free-text search, e.g. "sea view" or "near metro"' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_property_details',
      description: 'Get full details (price, specs, amenities, owner contact, rating) for one specific listing by its id. Use this before answering detailed questions about a listing the user has already found.',
      parameters: {
        type: 'object',
        properties: { propertyId: { type: 'string', description: 'The listing id' } },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_inquiry',
      description: "Send a contact message to a listing's owner on the user's behalf. Only call this after the user has clearly confirmed they want to send it, and you have their name, email, and a message. Ask for anything missing first — do not guess a name or email.",
      parameters: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          senderName: { type: 'string' },
          senderEmail: { type: 'string' },
          senderPhone: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['propertyId', 'senderName', 'senderEmail', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_favorite',
      description: "Save a listing to the signed-in user's favorites. Requires the user to be logged in — if they are not, tell them to log in instead of calling this.",
      parameters: {
        type: 'object',
        properties: { propertyId: { type: 'string' } },
        required: ['propertyId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_favorites',
      description: "List the signed-in user's saved/favorited listings. Requires the user to be logged in.",
      parameters: { type: 'object', properties: {} },
    },
  },
];

// --- condensed shapes for chat context (keep tokens small) -----------------

function condenseProperty(p) {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    listingType: p.listingType,
    propertyType: p.propertyType,
    city: p.city,
    state: p.state,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    areaSqft: p.areaSqft,
    averageRating: p.averageRating,
  };
}

// --- executors ---------------------------------------------------------
// Each returns { result: <object fed back to the LLM>, properties?: [...], actions?: [...] }
// `properties`/`actions` bubble up to the HTTP response so the frontend can
// render rich cards instead of the agent having to describe everything in prose.

async function search_properties(args) {
  const data = await propertyService.search(
    { ...args },
    { page: 0, size: 6, sortBy: 'createdAt', direction: 'desc' }
  );
  const condensed = data.content.map(condenseProperty);
  return {
    result: { count: data.totalElements, results: condensed },
    properties: data.content,
  };
}

async function get_property_details(args) {
  const property = await propertyService.getById(args.propertyId);
  return { result: property, properties: [property] };
}

async function submit_inquiry(args, ctx) {
  const inquiry = await inquiryService.create({
    propertyId: args.propertyId,
    senderName: args.senderName,
    senderEmail: args.senderEmail,
    senderPhone: args.senderPhone,
    message: args.message,
  });
  return {
    result: { sent: true, inquiryId: inquiry.id },
    actions: [{ type: 'inquiry_sent', propertyId: args.propertyId }],
  };
}

async function add_favorite(args, ctx) {
  if (!ctx.user) {
    return { result: { error: 'Not logged in. Ask the user to log in first, then try again.' } };
  }
  await favoriteService.addFavorite(ctx.user, args.propertyId);
  return {
    result: { saved: true },
    actions: [{ type: 'favorite_added', propertyId: args.propertyId }],
  };
}

async function list_favorites(args, ctx) {
  if (!ctx.user) {
    return { result: { error: 'Not logged in. Ask the user to log in first, then try again.' } };
  }
  const favorites = await favoriteService.getFavorites(ctx.user);
  return {
    result: { count: favorites.length, results: favorites.map(condenseProperty) },
    properties: favorites,
  };
}

const executors = { search_properties, get_property_details, submit_inquiry, add_favorite, list_favorites };

// Runs one tool call by name. `ctx` carries the requesting user (or null for guests).
async function runTool(name, args, ctx) {
  const fn = executors[name];
  if (!fn) throw new AppError(`Unknown tool: ${name}`, 400);
  try {
    return await fn(args || {}, ctx);
  } catch (e) {
    // Surface a clean error back to the LLM rather than letting it crash the loop.
    return { result: { error: e.message || 'That action failed.' } };
  }
}

module.exports = { toolDefs, runTool };
