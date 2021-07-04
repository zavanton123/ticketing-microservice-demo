import express, { Request, Response } from 'express';
import { Ticket } from "../models/ticket";
import { body } from 'express-validator';
import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@zatickets/common';
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put('/api/tickets/:id',
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('The title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    // if the orderId exists, that means that this ticket is reserved by the order
    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    // only the owner of the ticket can update it
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // update and save the ticket
    ticket.set({
      title: req.body.title,
      price: req.body.price
    });
    await ticket.save();

    // IMPORTANT: publish the event that the ticket has been updated to NATS
    // so that other microservices can receive this event
    // note: get the NATS client from singleton natsWrapper
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    res.send(ticket);
  });

export { router as updateTicketRouter };
