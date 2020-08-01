require("dotenv/config")

const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const port = 3001

const MongoClient = require("mongodb").MongoClient

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS")
  next()
})

let connect = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.htyqj.mongodb.net/<dbname>?retryWrites=true&w=majority`

MongoClient.connect(connect, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to Database!")

    const db = client.db("bloggies-db")
    const blogsCollection = db.collection("blogs")

    // Handlers
    app.get(`/blogs`, (req, res) => {
      const blogs = db
        .collection("blogs")
        .find()
        .toArray()
        .then(res)
        .then((data) => {
          res.json(data)
        })
        .catch((err) => res.send(err))
    })

    // POST used to create blogs
    app.post(`/create-blog`, (req, res) => {
      blogsCollection
        .insertOne(req.body)
        .then((result) => {
          res.redirect("/")
        })
        .catch((error) => console.log(error))
    })

    app.listen(port, () => {
      console.log(`listening on http://localhost:${port}`)
    })
  })
  .catch((err) => console.log(err))
