import mongoose from "mongoose";

async function db(){
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongoDB connected");
        
    } catch (error) {
        console.log(error);
    }
}

export default db