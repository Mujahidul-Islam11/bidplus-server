const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://skillswaphub-6e7fd.web.app"],
    credentials: true,
  })
);
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};



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

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.DB_ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });
    app.post("/userOut", async (req, res) => {
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    app.get("/Bids", async (req, res) => {
      
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await BidData.find(query).toArray();
      res.send(result);
    });

    app.get("/BidReq", verifyToken, async (req, res) => {
      if(req.user?.email !== req.query?.email){
        res.status(401).send({ message: "unauthorized access" });
      }
      let query = {};
      if (req.query.buyerEmail) {
        query = { buyerEmail: req.query.buyerEmail };
      }
      const result = await BidData.find(query).toArray();
      res.send(result);
    });

    app.get("/Jobs",  async (req, res) => {
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
    app.get("/JobEmail",verifyToken, async (req, res) => {
      if(req.user?.email !== req.query?.email){
        res.status(401).send({ message: "unauthorized access" });
      }
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

    app.put("/BidReq/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
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
