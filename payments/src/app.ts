import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { NotFoundError, errorHandler, currentUser } from "@evstickets/common";
import { createChargeRouter } from "./routes/new";

const app = express();
app.set("trust proxy", true); //trust traffic from proxy

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);

app.use(createChargeRouter);

// app.all handles posts and gets
app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
