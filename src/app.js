const express = require('express');
const cors = require('cors');
const profileRoutes = require('./routes/profile.routes');
const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

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

app.get('/api/test-auth', protect, (req, res) => {
    res.json({
        status: 'success',
        user: req.user
    });
});

app.use('/api/profiles', profileRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

app.use(errorHandler);

module.exports = app;