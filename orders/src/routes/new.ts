import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from '@zatickets/common';
import {body} from 'express-validator';
import {Ticket} from "../models/ticket";
import {Order} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post('/api/orders', requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      // this check is ok, but it created tight coupling with the tickets microservice
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // Find the ticket the user is trying to order in the DB
    const {ticketId} = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved.
    // Run query to look at all orders. Find an order where the ticket
    // is the ticket we just found and the order status is not cancelled
    // If such an order is found, then the ticket is reserved.
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the DB
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket
    });
    await order.save();

    // Publish an event saying the order has been created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    });

    res.status(201).send(order);
  });

export {router as newOrderRouter};
