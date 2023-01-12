const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connection setup with database with secure password on environment variable
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fhgmvqu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Create dynamic data and send to the database
async function run() {
    try {
        await client.connect();
        console.log('banglaEdTechResources database connected');
        const commentCollection = client.db('banglaEdTechResources').collection('comment');

        // 01. get all comments data from database
        app.get('/comment', async (req, res) => {
            const query = {};
            const cursor = commentCollection.find(query);
            const comments = await cursor.toArray();
            res.send(comments);
        });

        // 03. get topic-wise comments data from database
        app.get('/topic-wise-comment', async (req, res) => {
            const comment = req.body;
            const tutorial = comment?.tutorial || 'python';
            const topic = comment?.topic || 'introduction';
            console.log(tutorial, topic);
            
            const query = { tutorial: tutorial, topic: topic };
            const comments = await commentCollection.find(query).toArray();
            res.send(comments);
        });

        // 02. POST a comment from server-side to database
        app.post('/comment', async(req, res) => {
            const newComment = req.body;
            console.log('Adding a new comment', newComment);
            const result = await commentCollection.insertOne(newComment);
            res.send(result);
        });
    }
    finally {
        // await client.close(); // commented, if I want to keep connection active;
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Bangla-EdTech-Resources Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
});