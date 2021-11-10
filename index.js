const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000

const cors = require('cors');
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jug4s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('clayKingdom');
        const productCollection = database.collection("products");
        const reviewCollection = database.collection("reviews")
        //top products
        app.get('/topProducts', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.limit(6).toArray();
            res.send(products);
        })

        //all products
        app.get('/allProducts', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        //single products
        app.get('/allProducts/:id', async (req, res) => {
            const productId = req.params.id;
            const query = { _id: ObjectId(productId) }
            const product = await productCollection.findOne(query);
            // const product = await products.toArray();
            res.send(product);
        });
        //reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

    }

    finally {
        //await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Clay Kingdom server running successfully!')
})

app.listen(port, () => {
    console.log(`listening to the port:`, port)
})