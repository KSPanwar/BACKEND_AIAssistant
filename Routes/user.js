const { Router } = require("express");
const { PrismaClient } = require('@prisma/client');
const userValidation = require("../middlewares/verification");
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const authenticateToken = require("../middlewares/cookiecheck");
const config = require("../middlewares/variables");

const userrouter = Router();

// Route for testing if the server is working
userrouter.get('/', (req, res) => {
    res.send({ message: "Working in home" });
});


userrouter.get('/protected', authenticateToken, (req, res) => {
    res.send({ message: 'This is a protected route', user: req.user });
});

// Route for signing in with userValidation middleware
userrouter.post('/signin', userValidation, (req, res) => {
    const user = req.user
    console.log('In signin console' + user.id)
    // Send a response or handle further
    const token = jwt.sign({ userId: user.id },config.config.jwtSecret, { expiresIn: '1h' });
    res.cookie('authToken', token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        maxAge: 3600000 // Cookie expiration (1 hour)
    })

    res.send({ message: "User signed in successfully" });
});

// Route for creating a new user
userrouter.post('/signup', async (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).send({ message: "Name and email are required" });
    }

    try {
        const newUser = await prisma.user.create({
            data: { name, email, password },
        });
        res.json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send({ message: "Server error" });
    }
});

module.exports = userrouter;
