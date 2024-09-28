const { Pinecone } = require('@pinecone-database/pinecone');
const { config } = require('./middlewares/variables');

const pc = new Pinecone({
    apiKey:config.Pinecone_APIKEY
})
console.log('pc data',pc)
const index = pc.index('documentvectors')
console.log('index',index)
async function checkPineconeConnection() {
    try {
        const indexList = await pc.listIndexes();
        console.log('Pinecone indexes:', indexList);
    } catch (error) {
        console.error('Failed to connect to Pinecone:', error);
    }
}
const insertIntoVectorDb = async (userId, sectionData)=> {
    const upsertData = sectionData.map(section => ({
        id: String(userId) + '_' + section.metadata.topic, // Unique ID per user and topic
        values: section.sectionVector,
        metadata: {
            keywords: section.metadata.keywords,
            entities: section.metadata.entities,
            sanitizedText: section.metadata.section // Original section text
        }
    }));
    console.log(upsertData)

    try {
        await index.upsert(upsertData);
        console.log('Vector inserted successfully into Pinecone');
    } catch (error) {
        console.error('Error inserting vector into Pinecone:', error);
        throw new Error('Failed to insert vector into Pinecone');
    }
}

const questionSearch = async (queryRequest) =>{
    try {
        const queryResponse = await index.query(queryRequest)
        console.log('queryResponse',queryResponse)
        if (queryResponse.matches && queryResponse.matches.length > 0) {
            console.log('Metadata of the first match:', JSON.stringify(queryResponse.matches[0].metadata, null, 2));
            const relevantMetadata = queryResponse.matches.map(match => {
                // Extract only the necessary information
                
                return {
                    id: match.id, // or any identifier you want to keep
                    answer: match.metadata.sanitizedText ||'No answer available', // Replace 'relevantField' with the actual field name that contains the answer
                };
            });
            console.log('relevnat data',relevantMetadata)
            return relevantMetadata.length > 0 ? relevantMetadata : null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error querying Pinecone:', error);
        return error;
    }
}
checkPineconeConnection()

module.exports = {insertIntoVectorDb,questionSearch};
