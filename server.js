const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
var bodyParser = require('body-parser')

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const allUsers = []
const exercise = []

app.post("/api/users", (req, res) => {
  // Generating Random ID Symbols
  const randomChar = 'qwertyuiopasdfghjklzxcvbnm1234567890'
  let random = ''

  for (var i = 0; i < 24; i++) {
    random += randomChar.charAt(Math.floor(Math.random() * randomChar.length))
  }
  const username = req.body.username
  const singleUser = {
    username: username,
    _id: random
  }

  res.send(singleUser)
  allUsers.push(singleUser)
})

app.get("/api/users", (req, res) => {
  if (allUsers) {
    res.json(allUsers)
  }
  else {
    res.send({
      error: "No username added yet"
    })
  }
})

app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
  const searchedUser = allUsers.find(user => user._id == id)

  if (searchedUser) {
    exercise.push({
      id: searchedUser._id,
      description: description,
      duration: parseInt(duration),
      date: date
    })
    res.send({
      _id: searchedUser._id,
      username: searchedUser.username,
      description: description,
      duration: parseInt(duration),
      date: date
    })
  }
  else {
    res.json({
      error: "No user found for that ID"
    })
  }
})

app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query
  const id = req.params._id
  const singleUser = allUsers.find(user => user._id == id)
  let exerciseForSingleUser = exercise.filter(ex => ex.id == id)

  if (limit) {
    exerciseForSingleUser = exerciseForSingleUser.slice(0, parseInt(limit))
  }

  if (from){
    const fromD = new Date(from)
    exerciseForSingleUser = exerciseForSingleUser.filter(exe => new Date(exe.date) > fromD)
  }

  if (to){
    const toD = new Date(to)
    exerciseForSingleUser = exerciseForSingleUser.filter(exe => new Date(exe.date) < toD)
  }

  res.json({
    _id: singleUser._id,
    username: singleUser.username,
    count: exerciseForSingleUser.length,
    log: [
        ...exerciseForSingleUser
    ]
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})