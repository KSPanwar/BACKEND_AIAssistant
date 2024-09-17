const { Router } = require("express");
const authenticateToken = require("../middlewares/cookiecheck");
const multer = require("multer");
const path = require('path');

const loggedRouter = Router()
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
loggedRouter.post('/userpdf',authenticateToken,upload.single('documentFile'),(req,res)=>{
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a PDF or DOC/DOCX file' });
    }

    // File successfully uploaded
    res.send({
        message: 'File uploaded successfully',
        filePath: req.file.path
    });
})

module.exports=loggedRouter
