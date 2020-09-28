import mongoose from "mongoose";

const url =
  "mongodb+srv://Talha:Talha1234@cluster0.lkdbo.mongodb.net/MyData?retryWrites=true&w=majority";
// mongodb+srv://Talha:#Talha@123@cluster0.lkdbo.mongodb.net/Usermanagement?retryWrites=true&w=majority
// ("mongodb+srv://daskh:Daksh1998@cluster0.irsba.mongodb.net/NodeAPI?retryWrites=true&w=majority");Usermanagement

//config.db
export default async (db) => {
  try {
    const conn = await mongoose.connect(
      // url,
      process.env.MONGO_ATLAS_URL,
      // process.env.MONGO_URL,
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
