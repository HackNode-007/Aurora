require('dotenv').config();
const express = require("express")
const mongoose = require("mongoose")
const {authRouter} = require("./routes/auth");
const {userMiddleware} = require("./middleware/userMiddleware");
const app = new express()
app.use(express.json())
const mongoUri = process.env.MONGO_URI
const port = process.env.PORT

app.use('/api/auth',authRouter)
app.use(userMiddleware)

const main = async () => {
    await mongoose.connect(mongoUri).then(() => {
        console.log("connected to mongo db")
    })
    app.listen(port,() => {
        console.log(`app is listening on port: ${port}`)
    })
}

main()
