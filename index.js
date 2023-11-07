const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


app.use(express.json())
app.use(cors())

app.get('/', async(req, res)=>{
    res.send('Skill swap server is running ')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u8ojnwq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const JobsData = client.db("SkillSwap").collection("JobsData");

    app.post('/Jobs', async(req, res)=>{
        const cursor = req.body;
        const result = await JobsData.insertOne(cursor)
        res.send(result)
    })

    app.get('/Jobs', async(req, res)=>{
        const result = await JobsData.find().toArray()
        res.send(result)
    })

    app.get('/Jobs/:category', async(req, res)=>{
        const category = req.params.category
        const query = { category: category }
        const result = await JobsData.find(query).toArray()
        res.send(result)
    })

    app.get('/JobsId/:id', async(req, res)=>{
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await JobsData.findOne(query)
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`My server is running on port: ${port}`);
  });