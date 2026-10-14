// Validates required environment variables at boot so misconfiguration fails
// loudly on startup instead of silently breaking auth or the agent at runtime.

function required(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';

  required('MONGO_URI');
  const jwtSecret = required('JWT_SECRET');

  if (jwtSecret.length < 32) {
    const msg = `JWT_SECRET is too short (${jwtSecret.length} chars) — use at least 32 random characters. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`;
    if (isProd) throw new Error(msg);
    console.warn(`[env] WARNING: ${msg}`);
  }

  if (jwtSecret === 'change-this-to-a-long-random-string') {
    throw new Error('JWT_SECRET is still the placeholder value from .env.example — generate a real secret before running this anywhere, including locally.');
  }

  if (isProd) {
    required('CLIENT_ORIGIN');
    if (String(process.env.CLIENT_ORIGIN).includes('localhost')) {
      throw new Error('CLIENT_ORIGIN is set to localhost in production — set it to your real frontend URL.');
    }
    if (String(process.env.AGENT_ENABLED).toLowerCase() === 'true' && !process.env.GEMINI_API_KEY) {
      throw new Error('AGENT_ENABLED=true but GEMINI_API_KEY is not set.');
    }
  }

  const usingCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  if (isProd && !usingCloudinary) {
    console.warn('[env] WARNING: Cloudinary is not configured — file uploads will be saved to local disk, which will NOT survive most hosting platforms redeploying or scaling. Set CLOUDINARY_* env vars before going live.');
  }

  return { usingCloudinary };
}

module.exports = { validateEnv };
