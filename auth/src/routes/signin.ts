import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { User } from "../models/user";
import { Password } from "../services/password";
import { BadRequestError, validateRequest } from "@evstickets/common";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Please supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Does this user exist?
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      // Error...return
      throw new BadRequestError("Invalid credentials....");
    }

    // compare passwords
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      // Error...return
      throw new BadRequestError("Invalid credentials....");
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );
    console.log("Have created the web token: ", userJwt.toString());
    if (!req.session) {
      throw new BadRequestError("No active session...");
    }
    req.session.jwt = userJwt;

    //req.session = {
    //jwt: userJwt,
    // };

    console.log("Have stored jwt in session--sending resp 200");

    return res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
