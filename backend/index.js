require('dotenv').config();
const express = require("express")
const mongoose = require("mongoose")
var cors = require('cors')
const {authRouter} = require("./routes/auth");
const userRouter = require("./routes/user");
const {userMiddleware} = require("./middleware/userMiddleware");
const app = new express()

app.use(express.json())
app.use(cors())
const mongoUri = process.env.MONGO_URI
const port = process.env.PORT

app.use('/api/auth',authRouter)
app.use(userMiddleware)
app.use('user',userRouter)

const main = async () => {
    await mongoose.connect(mongoUri).then(() => {
        console.log("connected to mongo db")
    })
    app.listen(port,() => {
        console.log(`app is listening on port: ${port}`)
    })
}

main()
