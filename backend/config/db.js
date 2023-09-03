const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();


const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(process.env.MONGO_URI, {  //from this to this
      const conn = await mongoose.connect(process.env.MANGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;