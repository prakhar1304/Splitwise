import mongoose from "mongoose";
import { DB_NAME } from "../constant.js"

const connectDb = async () => {
    try {
        const dbURl = `${process.env.MONGODB_URI}/${DB_NAME}`
        await mongoose.connect(dbURl)
    } catch (error) {
        console.log(error)
        // throw new Error(error)
        process.exit(1)
    }
}


export default connectDb;