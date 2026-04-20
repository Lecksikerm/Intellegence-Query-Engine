const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        page: 1,
        limit: 10,
        total: 0,
        data: []
    });
});

module.exports = router;