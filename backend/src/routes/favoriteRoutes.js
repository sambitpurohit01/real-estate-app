const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/favoriteController');
const router = express.Router();
router.get('/', protect, ctrl.getFavorites);
router.post('/:propertyId', protect, ctrl.addFavorite);
router.delete('/:propertyId', protect, ctrl.removeFavorite);
module.exports = router;
