const { HfInference } = require('@huggingface/inference');
const { config } = require('../../middlewares/variables');

// Replace 'your_api_key_here' with your actual API key
const hf = new HfInference(config.Huggyface_API); 

async function generateVector(inputText) {
    try {
        // Use a model that generates embeddings, such as 'sentence-transformers/all-MiniLM-L6-v2'
        const modelId = 'sentence-transformers/all-MiniLM-L6-v2'; // Example model
        
        const response = await hf.featureExtraction({
            model: modelId,
            inputs: inputText,
        });
        return response;

        
    } catch (error) {
        console.error('Error generating vector:', error);
    }
}

module.exports=generateVector;