import mongoose from "mongoose";

const database = async () => {
    try{
        const connect = await mongoose.connect(process.env.DATABASE_URL)
        console.log("✅ Database connected successfully:", connect.connection.host, connect.connection.name);
   } catch(err){
    console.error(err);
    process.exit(1);   }
}

export default database

