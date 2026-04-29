const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const profileRoutes = require('./routes/profile.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

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
app.use('/api/profiles', profileRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

app.use(errorHandler);

module.exports = app;