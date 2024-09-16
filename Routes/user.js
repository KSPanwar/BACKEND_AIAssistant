const { Router } = require("express");
const { PrismaClient } = require('@prisma/client');
const userValidation = require("../middlewares/verification");
const prisma = new PrismaClient();

const userrouter = Router();

// Route for testing if the server is working
userrouter.get('/signup', (req, res) => {
    res.send({ message: "Working" });
});

// Route for signing in with userValidation middleware
userrouter.post('/signin', userValidation, (req, res) => {
    console.log("Hello from next");
    // Send a response or handle further
    res.send({ message: "User signed in successfully" });
});

// Route for creating a new user
userrouter.post('/user', async (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).send({ message: "Name and email are required" });
    }

    try {
        const newUser = await prisma.user.create({
            data: { name, email },
        });
        res.json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send({ message: "Server error" });
    }
});

module.exports = userrouter;
