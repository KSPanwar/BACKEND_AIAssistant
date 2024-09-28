const fs = require('fs')
const pdfParse = require('pdf-parse')
const readPdf = async(filePath)=>{
    const dataBuffer = fs.readFileSync(filePath)
    try {
        const data = await pdfParse(dataBuffer);
        return data.text; // This will return the extracted text from the PDF
    } catch (error) {
        console.error("Error parsing PDF: ", error);
        return null;
    }
}


module.exports=readPdf