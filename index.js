const  express = require('express')
const userrouter = require('./Routes/user')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const loggedRouter = require('./Routes/upload');

const { config } = require('./middlewares/variables');
//const { Pinecone } = require('@pinecone-database/pinecone');
const app = express()
const PORT =3000
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/user',userrouter)
app.use('/loggedin',loggedRouter)

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});
app.listen(PORT,()=>{
    console.log("Running on PORT")
})


