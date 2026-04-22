const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

router.get('/search', profileController.searchProfiles);
router.get('/', profileController.getProfiles);

module.exports = router;