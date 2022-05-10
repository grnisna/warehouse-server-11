const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware----------
app.use(cors());
app.use(express.json());


//---------varify token --------
function varifyToken(req, res, next) {
    const getToken = req.headers.authorization;
    console.log(getToken);
    if (!getToken) {
        return res.status(401).send({ message: 'UnAuthorized' });
    }
    const token = getToken.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden' });
        }
        else {
            req.decoded = decoded;
            next();
        }
    })
}
// function varifyToken(req, res, next) {
//     const getToken = req.get('authorization');
//     console.log('gettoken',getToken);
//   next();
// }
// --------------connet to mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fenty.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const electronicsCollection = client.db('electronics').collection('items');

        // ----------------------token set---------------
        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
            res.send({ token });
        })
        //---------------------get items-----------=
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = electronicsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // --------------update item----------
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await electronicsCollection.findOne(query);
            res.send(result);
        });

        app.put('/items/:id', async (req, res) => {
            const id = req.params.id;
            const updateItem = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateQuantity = {
                $set: {
                    quantity: updateItem.quantity
                }
            };
            const result = await electronicsCollection.updateOne(filter, updateQuantity, options);
            res.send(result);
        });
        // --------------------------add new item----------------
        app.get('/manage', varifyToken, async (req, res) => {
            const varifyEmail = req.decoded.email;
            const email = req.query.email;

            if (email === varifyEmail) {
                const query = { email: email };
                const cursor = electronicsCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'Forbidden' });
            }
        });

        app.post('/manage', async (req, res) => {
            const addItem = req.body;
            const result = await electronicsCollection.insertOne(addItem);
            res.send(result);
        });

        //--------------------delete item---------------
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await electronicsCollection.deleteOne(query);
            res.send(result);
        })


    }
    finally {
        // client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {

    res.send('WareHouse is running');

});

// -----------------
app.listen(port, () => {
    console.log('Running port is:', port);
})