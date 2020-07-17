require('dotenv/config')

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

const MongoClient = require("mongodb").MongoClient;

app.use(bodyParser.urlencoded({ extended: true }));

let connect = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.htyqj.mongodb.net/<dbname>?retryWrites=true&w=majority`

MongoClient.connect(connect, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to Database!");

    const db = client.db("bloggies-db");
    const blogsCollection = db.collection("blogs");

    // Handlers
    app.get("/", (req, res) => {
      const cursor = db
        .collection("blogs")
        .find()
        .toArray()
        .then((results) => {
          console.log(results);
        })
        .catch((err) => console.log(err));

      res.sendFile(__dirname + "/index.html");
    });

    // POST used to create blogs
    app.post("/create-blog", (req, res) => {
      blogsCollection
        .insertOne(req.body)
        .then((result) => {
          res.redirect("/");
        })
        .catch((error) => console.log(error));
    });

    app.listen(port, () => {
      console.log(`listening on localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));
