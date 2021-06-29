import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from '@zatickets/common';
import {body} from 'express-validator';
import {Ticket} from "../models/ticket";
import {Order} from "../models/order";

const router = express.Router();

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

    // Make sure that this ticket is not already reserved
    // Run query to look at all orders. Find an order where the ticket
    // is the ticket we just found and the order status is not cancelled
    // If such an order is found, then the ticket is reserved
    const existingOrder = await Order.findOne({
      ticket: ticket,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete
        ]
      }
    });
    if (existingOrder) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order

    // Build the order and save it to the DB

    // Publish an event saying the order has been created


    res.send({});
  });

export {router as newOrderRouter};
