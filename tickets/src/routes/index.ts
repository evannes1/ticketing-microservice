import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { NotFoundError } from "@evstickets/common";

const router = express.Router();

router.get("/api/tickets/", async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined,
  });

  //console.log("Sending back the ticket: ", ticket);

  res.send(tickets);
});

export { router as indexTicketRouter };
