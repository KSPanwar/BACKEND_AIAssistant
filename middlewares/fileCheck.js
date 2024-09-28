const userFiles = require('../uploads/userFilesTracker')
function fileCheck(req,res,next){
    console.log(req.user)
    const userId = req.user.userId;
    console.log(userFiles)
    if (userFiles[userId]) {
        return res.status(400).send({
            message: 'You already have a file uploaded. Please remove it before uploading a new one.'
        });
    }
    next()
}
module.exports=fileCheck