const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
//nisan
//uA9BpK7i8tIoNerD
// --------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fenty.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const electronicsCollection = client.db('electronics').collection('items');

        app.get('/items', async(req, res)=>{
            const query = {};            
            const cursor = electronicsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // --------------update item----------
        app.get('/items/:id' , async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await electronicsCollection.findOne(query);
            res.send(result);
        });

        app.put('/items/:id',async(req,res)=>{
            const id = req.params.id;
            const updateItem = req.body;
            
            const filter = {_id:ObjectId(id)};
            const options = { upsert: true };
            const updateQuantity = {
                $set:{
                    quantity:updateItem.quantity
                }
            };
            const result = await electronicsCollection.updateOne(filter,updateQuantity,options);
            res.send(result);
        });
        // --------------------------add new item----------------
        app.get('/manage', async(req,res)=>{
            const email = req.query.email;
            console.log(email);
            const query = {email:email};
            const cursor = electronicsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/manage',async(req, res)=>{
            const addItem = req.body;
            const result = await electronicsCollection.insertOne(addItem);
            res.send(result);
        });

        //--------------------delete item---------------
        app.delete('/items/:id',async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await electronicsCollection.deleteOne(query);
            res.send(result);
        })
        

    }
    finally{
        // client.close();
    }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('WareHouse is running');
});

// -----------------
app.listen(port, ()=>{
    console.log('Running port:', port);
})