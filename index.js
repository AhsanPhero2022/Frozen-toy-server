const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsh8x1y.mongodb.net/?retryWrites=true&w=majority`;
// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const frozenCollection = client.db("DesnyToys").collection("frozen");

    app.get("/frozen", async (req, res) => {
      const cursor = frozenCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/frozenSort", async (req, res) => {
      try {
        const result = await frozenCollection.find().toArray();
        const sortedResult = result.sort((a, b) => a.price - b.price); // Sort by price in ascending order
        res.send(sortedResult);
      } catch (error) {
        console.error("Error retrieving frozen items:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/frozenSearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await frozenCollection
        .find({
          $or: [
            { title: { $regex: text, $options: "i" } },
            { sub_category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    app.get("/frozen/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await frozenCollection.findOne(query);
      res.send(result);
    });

    app.get("/myToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await frozenCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/frozen", async (req, res) => {
      const newFrozen = req.body;

      const result = await frozenCollection.insertOne(newFrozen);
      res.send(result);
    });

    app.put("/frozen/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const options = { upsert: true };
      const updatedFrozen = req.body;
      const update = {
        $set: {
          Price: updatedFrozen.Price,
          quantity: updatedFrozen.quantity,
          description: updatedFrozen.description,
        },
      };
      const result = await frozenCollection.updateOne(filter, update, options);
      res.send(result);
    });

    app.delete("/frozen/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await frozenCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
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

app.get("/", (req, res) => {
  res.send("Assignment server is Running");
});

app.listen(port, () => {
  console.log(`Assignment Server Is Running on Port ${port}`);
});
