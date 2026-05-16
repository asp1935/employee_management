import mongoose from "mongoose";
import dns from "dns";

// Set DNS servers to Google DNS to bypass local ISP SRV lookup failures
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log(`MONGODB CONNECTED !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
}

export default connectDB;