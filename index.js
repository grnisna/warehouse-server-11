const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
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