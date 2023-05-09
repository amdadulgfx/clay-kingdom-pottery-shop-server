const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5001

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
        const reviewCollection = database.collection("reviews");
        const orderCollection = database.collection("orders");
        const userCollection = database.collection("users");
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
            res.send(product);
        });
        //reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        // orders
        app.get('/allOrders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })

        //orders read from database of specific user
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { email: email }
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray()
            // console.log(orders);
            res.json(orders)
        })
        //if email admin or not 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            };
            res.json({ admin: isAdmin })
        })

        //orders post to the database
        app.post('/orders', async (req, res) => {
            const data = req.body;
            const order = await orderCollection.insertOne(data);
            res.json(order)
        })
        //reviews post to the database
        app.post('/reviews', async (req, res) => {
            const data = req.body;
            const review = await reviewCollection.insertOne(data);
            res.json(review)
        })
        //users
        app.post('/users', async (req, res) => {
            const data = req.body;
            const user = await userCollection.insertOne(data);
            res.json(user)
        })
        //products
        app.post('/addProduct', async (req, res) => {
            const data = req.body;
            const product = await productCollection.insertOne(data);
            res.json(product)
        })
        //
        //delete orders 
        app.delete('/allOrders/:id', async (req, res) => {
            const productId = req.params.id;
            // console.log(productId);
            const query = { _id: ObjectId(productId) }
            const order = await orderCollection.deleteOne(query);
            res.json(order);
        });
        //delete products
        app.delete('/allProducts/:id', async (req, res) => {
            const productId = req.params.id;
            // console.log(productId);
            const query = { _id: ObjectId(productId) }
            const product = await productCollection.deleteOne(query);
            res.json(product);
        });

        //set admin update
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        //status update
        app.put('/allOrders/:id', async (req, res) => {
            const productId = req.params.id;
            const filter = { _id: ObjectId(productId) }
            let order = req.body;
            const updateDoc = { $set: order }
            const result = await orderCollection.updateOne(filter, updateDoc);
            res.json(result)
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