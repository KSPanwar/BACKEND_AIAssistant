const jwt = require('jsonwebtoken');
const config = require('./variables');

 // Use the same secret key as in sign-in

function authenticateToken(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).send({ message: 'Access denied' });
    }

    jwt.verify(token, config.config.jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).send({ message: 'Invalid token' });
        }
        console.log('In authenticate token', user)
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
