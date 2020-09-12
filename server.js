import Express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRouter from "./routes/authRoute.js";

dotenv.config({ path: "./config/config.env" });

const app = new Express();

//connect to database
connectDB();

//use body-parser
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));

//configer for only development
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      // origin : process.env.CLIENT_URL,
      origin: "*",
      credentials: true,
    })
  );

  //morgan give information about each module
  app.use(morgan("dev"));
}

//use routes

app.use("/api/", authRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Page Not Found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App is listing on port${PORT}`);
});

export default app;
