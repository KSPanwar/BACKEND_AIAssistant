const { Router } = require("express");
const authenticateToken = require("../middlewares/cookiecheck");
const multer = require("multer");
const path = require('path');
const readPdf = require("../docs/readpdf");
const fileCheck = require("../middlewares/fileCheck");
const userFiles = require("../uploads/userFilesTracker");
const fs = require('fs')
const natural = require('natural')
const {NlpManager, Language} = require('node-nlp');
const { extractKeywords, extractEntities } = require("../CategoizeData/categorizeData");
const extractKeywordsAndEntities = require("../CategoizeData/categorizeData");
const generateVector = require("../DB/VectorDB/generateVector");
const { insertIntoVectorDb, questionSearch } = require("../db");


const loggedRouter = Router()


const manager = new NlpManager({ languages: ['en'] });

async function loadModels() {
    await manager.train();
}
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+ path.extname(file.originalname))
    }
})

const fileFilter = (req,file,cb)=>{
    if(
        file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only PDFs and Word documents (DOC/DOCX) are allowed'), false); // Reject file
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // 10 MB file size limit
});
loggedRouter.post('/userpdf',authenticateToken,fileCheck,upload.single('documentFile'),async (req,res)=>{
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a PDF or DOC/DOCX file' });
    }
    const userId = req.user.userId;
    userFiles[userId]=req.file.path
    console.log('In userpdf method',userFiles)
    // File successfully uploaded
   const data = await readPdf(req.file.path)
   console.log('user',data)
    const sectionData= await extractKeywordsAndEntities(data)

    try {
        // Call the insertIntoVectorDb function
        await insertIntoVectorDb(userId, sectionData); // Make sure parameters are in the correct order
        res.send({
            message: 'File uploaded successfully',
        });
    } catch (error) {
        console.error('Error during vector insertion:', error);
        res.status(500).send({ message: 'Failed to insert vector into database' });
    }

})

loggedRouter.post('/question',authenticateToken,async (req,res)=>{
    const userId = req.user.userId;
    const question = req.body.question
    if(!question){
        return res.status(400).json({
            message:'Question is required'
        })
    }
    try {
        const questionVector =  await generateVector(question);
        console.log('questionvector',questionVector)
        const queryRequest = {
            vector: questionVector,
            topK: 1, // Retrieve the closest match
            includeMetadata: true, // Retrieve metadata (keywords, entities, etc.)
            includeValues:true
        };
        const result = await questionSearch(queryRequest)
        console.log('result',result)
        if (result) {
           
            
            res.json({
                message: 'Match found',
                result:result
            });
        } else {
            res.json({ message: 'No match found' });
        }
    } catch (error) {
        console.error('Error in /question:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }


})

loggedRouter.delete('/userpdfs', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    // Check if user has a file to delete
    if (!userFiles[userId]) {
        return res.status(400).send({ message: 'No file to remove.' });
    }

    // Delete the file from the file system
    const filePath = userFiles[userId];
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error removing file.' });
        }

        // Clear the file reference
        delete userFiles[userId];

        res.send({ message: 'File removed successfully.' });
    });
});

loggedRouter.get('/check',authenticateToken,fileCheck,(req,res)=>{
    res.send("hello working")
})
// function categorizeData(data) {
//     // 1. Keyword Extraction
//     const keywords = extractKeywords(data)// Implement this function based on your needs
    
//     // 2. NER
//     const entities = extractEntities(data); // Implement this function using NER library
    
//     // 3. Text Classification
//      // Implement this function using your classification model

//     // Combine results into categories
//     const categories = {
//         keywords: keywords,
//         entities: entities,
//     };

//     return categories;
// }


module.exports=loggedRouter
