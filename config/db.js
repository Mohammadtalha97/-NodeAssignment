import mongoose from "mongoose";

const url =
  "mongodb+srv://talha:#Talha@123@cluster0.irsba.mongodb.net/userTalha?retryWrites=true&w=majority";

//config.db
export default async (db) => {
  try {
    const conn = await mongoose.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      },
      () => console.log("DB connected")
    );
    return conn;
  } catch (err) {
    throw new Error("MongoDB connection err: " + err);
  }
};
