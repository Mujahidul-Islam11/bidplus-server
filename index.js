const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.send("Skill swap server is running ");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u8ojnwq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const JobsData = client.db("SkillSwap").collection("JobsData");
    const BidData = client.db("SkillSwap").collection("BidData");

    app.post("/Jobs", async (req, res) => {
      const cursor = req.body;
      const result = await JobsData.insertOne(cursor);
      res.send(result);
    });

    app.post("/Bids", async (req, res) => {
      const cursor = req.body;
      const result = await BidData.insertOne(cursor);
      res.send(result);
    });

    app.get("/Bids", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await BidData.find(query).toArray();
      res.send(result);
    });

    app.get("/BidReq", async (req, res) => {
      let query = {};
      if (req.query.buyerEmail) {
        query = { buyerEmail: req.query.buyerEmail };
      }
      const result = await BidData.find(query).toArray();
      res.send(result);
    });

    app.get("/Jobs", async (req, res) => {
      const result = await JobsData.find().toArray();
      res.send(result);
    });

    app.get("/Jobs/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await JobsData.find(query).toArray();
      res.send(result);
    });

    app.get("/JobsId/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await JobsData.findOne(query);
      res.send(result);
    });
    app.get("/JobEmail", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await JobsData.find(query).toArray();
      res.send(result);
    });

    app.put("/JobsId/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = req.body;
      const updatedJobs = {
        $set: {
          email: update.email,
          jobTitle: update.jobTitle,
          deadline: update.deadline,
          price: update.price,
          description: update.description,
          category: update.category,
          status: update.status,
        },
      };
      const result = await JobsData.updateOne(filter, updatedJobs);
      res.send(result);
    });

    app.put('/BidReq/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const updateStatus = {
        $set: {
          status: req.body.status,
        },
      };

      const result = await BidData.updateOne(query, updateStatus);
      res.send(result);
    });

    app.delete("/JobsId/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await JobsData.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`My server is running on port: ${port}`);
});
