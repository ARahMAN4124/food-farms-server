const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

const port = 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g1gfx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const productCollection = client.db("organicdb").collection("products");
  const ordersCollection = client.db("organicdb").collection("orders");

  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    productCollection.insertOne(newProduct).then((res) => {
      console.log("add Count", res.insertedCount);
    });
  });

  app.get("/products", (req, res) => {
    productCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/checkout/:id", (req, res) => {
    productCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.delete("/delete/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    console.log(id);
    productCollection.findOneAndDelete({ _id: id }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });

  app.post("/orders", (req, res) => {
    const newOrder = req.body;
    ordersCollection.insertOne(newOrder).then((res) => {
      res.insertedCount > 0;
    });
  });

  app.get("/orderList", (req, res) => {
    ordersCollection
      .find({ customerEmail: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
