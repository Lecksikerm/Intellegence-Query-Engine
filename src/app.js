const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const profileRoutes = require('./routes/profile.routes');
const authRoutes = require('./routes/auth.routes');
const v1ProfileRoutes = require('./routes/v1.profile.routes');

const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);
app.use('/api/auth', authLimiter);
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
app.use('/api/v1/profiles', v1ProfileRoutes);
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