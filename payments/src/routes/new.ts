import {stripe} from "../../stripe";
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, OrderStatus, requireAuth, validateRequest } from "@zatickets/common";
import { Order } from "../models/order";

const router = express.Router();

router.post('/api/payments',
  requireAuth,
  [
    body('token')
      .not()
      .isEmpty(),
    body('orderId')
      .not()
      .isEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      // todo zavanton - for some reason the errors are not processed correctly here...
      // throw new NotFoundError();
      return res.status(404).send({});
    }
    if (order.userId !== req.currentUser!.id) {
      // todo zavanton - for some reason the errors are not processed correctly here...
      // throw new NotAuthorizedError();
      return res.status(401).send({});
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    // Actually make the payment using Stripe
    await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token
    });

    res.send({ success: true });
  }
);

export { router as createChargeRouter };
