import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Data base connected"))
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`)
    } catch (error) {
        console.log("Data base connection failed: ", error.message);
    }
}

export default connectDB;