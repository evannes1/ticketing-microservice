import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { User } from "../models/user";
import { BadRequestError, validateRequest } from "@evstickets/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Does this user already exist?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already in use");
    }

    // Create the user
    console.log("will create the user, email: ", email);
    const user = User.build({ email, password });
    await user.save();

    // generate web token
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );
    console.log("Have created the web token: ", userJwt.toString());
    if (!req.session) {
      throw new BadRequestError("No active session...");
    }
    req.session.jwt = userJwt;

    //req.session = {
    // jwt: userJwt,
    // };

    // console.log("Have stored jwt in session--sending resp 201");

    return res.status(201).send(user);
  }
);

export { router as signUpRouter };
