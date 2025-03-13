const express = require('express')
require('dotenv').config()
const dbConnect = require('./config/DbConnect')
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 8888

// Cấu hình CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

dbConnect()
initRoutes(app)


app.use('/', (req, res) => {
   res.send("Server On")
})

app.listen(port, () => {
    console.log("Server running on port:", port);
})