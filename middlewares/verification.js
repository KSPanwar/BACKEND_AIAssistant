const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function userValidation(req,res,next){
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({
            message: "Name and email are required"
        });
    }
    try {
        // Example logic: check if user exists
        const user = await prisma.user.findUnique({
            where: { email,password }
        });

        if (user) {
            res.json({ message: "User exists", user });
            next()
        } else {
            res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ message: "Server error", error });
    }
}
module.exports=userValidation