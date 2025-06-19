import mongoose from "mongoose";
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected : ${conn.connection.host}`)
    }
    catch(err){
        console.log("Connection failed",err)
        process.exit(1); //1 means failure

    }
}
export default connectDB