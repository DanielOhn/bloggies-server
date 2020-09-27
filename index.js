require("dotenv/config")

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const bcrypt = require("bcrypt")

const { ObjectId } = require("mongodb")

const app = express()
const port = 3001

const MongoClient = require("mongodb").MongoClient

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(
  cors({
    origin: "http://localhost:3000",
  })
)

let connect = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.htyqj.mongodb.net/<dbname>?retryWrites=true&w=majority`
const saltRounds = 12

MongoClient.connect(connect, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to Database!")

    const db = client.db("bloggies-db")
    const blogsCollection = db.collection("blogs")
    const usersCollection = db.collection("users")

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

    app.put(`/update-blog`, (req, res) => {
      let { id, name, blog } = req.body

      blogsCollection
        .findOneAndUpdate(
          { _id: ObjectId(id) },
          { $set: { name: name, blog: blog } },
          { upsert: true }
        )
        .then((res) => {
          if (res.ok) return res.json("Success")
        })
        .catch((err) => console.error(err))
    })

    app.delete(`/delete-blog`, (req, res) => {
      let { id, name } = req.body

      blogsCollection
        .deleteOne({ _id: ObjectId(id) })
        .then((result) => {
          if (result.deletedCount === 0) return res.json(`No blog to delete`)

          res.json(`Deleted ${name}`)
        })
        .catch((err) => console.error(err))
    })

    app.get(`/users`, (req, res) => {
      const users = db
        .collection("users")
        .find()
        .toArray()
        .then(res)
        .then((data) => res.json(data))
        .catch((err) => res.send(err))
    })

    app.post(`/create-user`, (req, res) => {
      let { username, email, password } = req.body

      if (email === undefined) email = ""

      // console.log(req.body)

      // res.redirect('/')

      bcrypt.hash(password, saltRounds, (err, hash) => {
        usersCollection
          .insertOne({ username: username, email: email, password: hash })
          .then((data) => {
            if (data) res.redirect("/")
          })
          .catch((err) => console.log(err))
      })
    })

    app.listen(port, () => {
      console.log(`listening on http://localhost:${port}`)
    })
  })
  .catch((err) => console.log(err))
