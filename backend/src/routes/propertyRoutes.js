const express = require('express');
const { protect } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { propertySchema, propertyUpdateSchema } = require('../validation/schemas');
const ctrl = require('../controllers/propertyController');
const router = express.Router();

router.get('/', ctrl.search);
router.get('/my-listings', protect, ctrl.myListings); // before /:id so it isn't swallowed by the param route
router.get('/:id', ctrl.getById);
router.post('/', protect, validateBody(propertySchema), ctrl.create);
router.put('/:id', protect, validateBody(propertyUpdateSchema), ctrl.update);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
