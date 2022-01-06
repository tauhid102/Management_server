const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
// change by another folder
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jfvuq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('bookShop');
        const booksCollection = database.collection('books');
        const purchasedCollection = database.collection('purchased');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        app.get('/books', async (req, res) => {
            const cursor = booksCollection.find({});
            const books = await cursor.toArray();
            res.send(books);
        });

        //save order data
        app.post('/purchased', async (req, res) => {
            const cursor = req.body;
            const result = await purchasedCollection.insertOne(cursor);
            res.json(result);
        });
        // fetch by id
        app.get('/books/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await booksCollection.findOne(query);
            console.log('load', result);
            res.send(result);
        });
        //find order using email
        app.get('/purchased', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = purchasedCollection.find(query);
            const buy = await cursor.toArray();
            res.json(buy);
        });
        //cancel order
        app.delete('/purchased/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await purchasedCollection.deleteOne(query);
            res.json(result);
        });
        //set review
        app.post('/reviews', async (req, res) => {
            const cursor = req.body;
            const result = await reviewsCollection.insertOne(cursor);
            res.json(result);
        });
        //set user in database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        //find admin role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        //add product
        app.post('/books', async (req, res) => {
            const cursor = req.body;
            const result = await booksCollection.insertOne(cursor);
            res.json(result);
        });
    }
    finally {
        //a
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server Start');
});
app.listen(port, () => {
    console.log('Listening to port', port)
})


