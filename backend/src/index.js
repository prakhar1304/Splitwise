import connectDb from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
connectDb()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
        console.log("Database connected")
    })
    .catch((err) => {
        console.log(err)
        process.exit(1)
    })