import mongoose from 'mongoose';


//config.db
export default async (db) => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URL, 
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify : false,
        useCreateIndex : true
      }, 
      () => console.log('DB connected'));
    return conn;
  } catch (err) {
    throw new Error('MongoDB connection err: ' + err);
  }
};
