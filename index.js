const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // await client.connect();
        client.connect();
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
            const comment = req.query;
            // console.log(comment);
            
            // const tutorial = comment?.tutorial || 'python';
            // const topic = comment?.topic || 'introduction';
            // console.log(tutorial, topic);
            
            const query = { tutorial: comment.tutorial, topic: comment.topic };
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

        // 04. Load a particular comment data from database - (id-wise)
        app.get('/comment/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await commentCollection.findOne(query);
            res.send(result);
        });

        // 05. DELETE a particular comment from server-side to database
        app.delete('/topic-wise-comment/:id', async(req, res) => {
            const id = req.params.id;
            const comment = req.query;
            const query = {tutorial: comment.tutorial, topic: comment.topic, _id: ObjectId(id)};
            const result = await commentCollection.deleteOne(query);
            console.log('One comment is deleted');
            res.send(result);
        });

        // 06. Update a comment in server-side and send to the database
        app.put('/comment/:id', async(req, res) => {
            // const id = req.params.id;
            const commentData = req.body;
            const filter = {_id: ObjectId(commentData.id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    comment: commentData.comment
                }
            };
            const result = await commentCollection.updateOne(filter, updatedDoc, options);
            console.log('Product is updated');
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