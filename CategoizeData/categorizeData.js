const axios = require('axios');
const config = require('../middlewares/variables');
const qs = require('qs');
const generateVector = require('../DB/VectorDB/generateVector');
// const natural = require('natural');
// const nlp = require('compromise');
// const TfIdf = natural.TfIdf;

// function extractKeywords(text) {
//     const tfidf = new TfIdf();
//     tfidf.addDocument(text);
    
//     const keywords = [];
    
//     // Using bigrams or trigrams for more meaningful keywords
//     const numOfKeywords = 5;
//     tfidf.listTerms(0).forEach(item => {
//         if (keywords.length < numOfKeywords) {
//             keywords.push(item.term);
//         }
//     });

//     // Use N-grams or POS tagging for better keyword extraction
//     const tokenizer = new natural.WordTokenizer();
//     const tokens = tokenizer.tokenize(text);

//     // Further refine keywords by filtering based on POS
//     const refinedKeywords = tokens.filter(token => {
//         // Use a list of stop words to exclude non-significant terms
//         return !natural.Stopwords.isStopword(token);
//     });

//     return refinedKeywords.slice(0, numOfKeywords); // Limit to top 5 keywords
// }

// function extractEntities(text) {
//     let doc = nlp(text);
//     const people = doc.people().out('array');
//     const organizations = doc.organizations().out('array');
//     const places = doc.places().out('array');

//     return {
//             people: [...new Set(people)],
//             places: [...new Set(places)],
//             organizations: [...new Set(organizations)],
//     };
// }
// module.exports ={
//     extractEntities,
//     extractKeywords
// }



async function extractKeywordsAndEntities(text) {
    try {
        // Sanitize the input text
        const sections = text.split(/\n\s*\n/);
        // Make sure the API key is available
        if (!config.config.API_KEY_TEXTRAZOR) {
            throw new Error('API Key for TextRazor is missing.');
        }
        const sectionData = [];
        for (const section of sections) {
            console.log('section fo each',section)
            const sanitizedSection = section.trim(); // Ensure the section is valid
            if (!sanitizedSection) continue; // Skip empty sections

            // Create the payload for the current section
            const payload = qs.stringify({
                text: sanitizedSection,
                extractors: 'entities,topics'
            });

            // Send POST request to TextRazor for the current section
            const response = await axios.post('https://api.textrazor.com', payload, {
                headers: {
                    'X-TextRazor-Key': config.config.API_KEY_TEXTRAZOR,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

        // Extract entities and topics from response
        const extractedEntities = response.data.response.entities || [];
        const extractedTopics = response.data.response.topics || [];

        const keywords = extractedTopics.map(topic => topic.label);
        const entities = extractedEntities.map(entity => entity.entityId || entity.matchedText);
        const sectionVector = await generateVector(section) //lets generate vector here only
        sectionData.push({
            sectionVector,
            metadata:{
            section: sanitizedSection, // Original section text
            keywords,
            entities,
            topic :keywords[0]||'general'
            }
        });
    }
    console.log('sectiondata',sectionData)
    return sectionData;
    } catch (error) {
        // Improved error logging
        console.error('TextRazor API Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to extract keywords and entities.');
    }
}

module.exports =extractKeywordsAndEntities