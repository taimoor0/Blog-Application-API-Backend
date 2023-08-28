const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("DataBase Connected Successfully");
  } catch (error) {
    console.log("Connection Failed!!!", error.message);
    process.exit(1);
  }
};

// module.exports = dbConnect
// OR
dbConnect();
