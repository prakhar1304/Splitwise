import connectDb from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 5000;

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
        console.log("Database connected")
    })
    .catch((err) => {
        console.log(err)
        process.exit(1)
    })