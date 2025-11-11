const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://SmartBillHub-db:Sd8byiB4bgcgObEV@cluster0.qcldgif.mongodb.net/?appName=Cluster0";

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
    await client.connect();

    const db = client.db("SmartBillHub-db");
    const billsCollection = db.collection("bills");
    const myBillsCollection = db.collection("myBills");

    // get all bills
    app.get("/all-bills", async (req, res) => {
      const category = req.query.category;
      const query = category && category !== "All" ? { category } : {};
      const result = await billsCollection.find(query).toArray();
      res.send(result);
    });

    // get 6 recent bills
    app.get("/bills", async (req, res) => {
      const result = await billsCollection
        .find()
        .sort({ date: -1 })
        .limit(6)
        .toArray();
      //   console.log(result);

      res.send(result);
    });

    // get bill details by id
    app.get("/bills/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await billsCollection.findOne(query);
      res.send(result);
    });

    // save paid bill to myBills
    app.post("/myBills", async (req, res) => {
      const billData = req.body;
      const result = await myBillsCollection.insertOne(billData);
      res.send(result);
    });

    // get bills for logged-in user
    app.get("/my-bills", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ error: "Email required" });

      const bills = await myBillsCollection.find({ email }).toArray();
      res.send(bills);
    });

    // update a bill
    app.put("/my-bills/:id", async (req, res) => {
      const id = req.params.id;
      const { amount, address, phone, date } = req.body;

      const result = await myBillsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { amount, address, phone, date } }
      );

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

app.get("/", (req, res) => {
  res.send("SmartBillHub server is running");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
