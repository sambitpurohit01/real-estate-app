require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const { validateEnv } = require('./src/config/env');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { generalLimiter } = require('./src/middleware/rateLimit');
const { uploadDir, usingCloudinary } = require('./src/middleware/upload');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const propertyRoutes = require('./src/routes/propertyRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const inquiryRoutes = require('./src/routes/inquiryRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const agentRoutes = require('./src/routes/agentRoutes');

// Fail fast on missing/weak config rather than limping along with an
// insecure JWT secret or silently pointing at localhost in production.
validateEnv();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Running behind a reverse proxy (Render, Railway, Fly, Nginx, etc.) — needed
// so rate limiting and logging see the real client IP, not the proxy's.
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));

// Supports a single origin or a comma-separated list (e.g. staging + prod).
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(mongoSanitize()); // strips $/. operators from user input — blocks NoSQL injection
app.use(hpp()); // guards against HTTP parameter pollution (?price=1&price=2 tricks)
app.use('/api', generalLimiter);

if (!usingCloudinary) {
  app.use('/uploads', express.static(uploadDir));
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/agent', agentRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Keystone API listening on http://localhost:${PORT}`);
      console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[server] File storage: ${usingCloudinary ? 'Cloudinary' : 'local disk (NOT suitable for production)'}`);
    });
  })
  .catch((err) => {
    console.error('[db] failed to connect:', err.message);
    process.exit(1);
  });
