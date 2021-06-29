import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import {requireAuth, validateRequest} from '@zatickets/common';
import {body} from 'express-validator';

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
    res.send({});
  });

export {router as newOrderRouter};
