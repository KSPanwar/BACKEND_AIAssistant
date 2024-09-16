const  express = require('express')
const userrouter = require('./Routes/user')
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const app = express()
const PORT =3000
const prisma = new PrismaClient();
app.use(bodyParser.json());
app.use('/',userrouter)


app.listen(PORT,()=>{
    console.log("Running on PORT")
})
