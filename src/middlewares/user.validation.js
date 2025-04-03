const { body, validationResult } = require('express-validator');

const validationUser = [
    body('first_name').isString().isLength({ min: 3 }),
    body('last_name').isString().isLength({ min: 3 }),
    body('email').isEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = validationUser;