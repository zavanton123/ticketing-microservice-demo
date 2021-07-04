import express, { Request, Response } from 'express';
// the common library must be published to npmjs.com
import { NotFoundError } from '@zatickets/common';
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };
