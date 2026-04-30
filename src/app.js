const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const profileRoutes = require('./routes/profile.routes');
const authRoutes = require('./routes/auth.routes');
const v1ProfileRoutes = require('./routes/v1.profile.routes');
const v2ProfileRoutes = require('./routes/v2.profile.routes');
const userRoutes = require('./routes/user.routes');

const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();
app.set('trust proxy', 1);

function normalizeOrigin(value) {
    return String(value || '')
        .trim()
        .replace(/\/+$/, '')
        .toLowerCase();
}

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = (process.env.CORS_ORIGINS || '')
            .split(',')
            .map((value) => normalizeOrigin(value))
            .filter(Boolean);
        const normalizedOrigin = normalizeOrigin(origin);

        if (
            !origin ||
            allowedOrigins.length === 0 ||
            allowedOrigins.includes(normalizedOrigin)
        ) {
            return callback(null, true);
        }
        return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);
app.use(['/api/auth', '/auth'], (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});
app.use('/api/auth', authLimiter);
app.use('/auth', authLimiter);
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Intelligence Query Engine API is running'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/profiles', v1ProfileRoutes);
app.use('/api/v2/profiles', v2ProfileRoutes);
app.use('/api/profiles', profileRoutes);

app.get('/api/test-auth', protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        user: req.user
    });
});

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

app.use(errorHandler);

module.exports = app;