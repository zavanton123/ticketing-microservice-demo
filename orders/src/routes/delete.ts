import express, {Request, Response} from 'express';
import {requireAuth, NotFoundError, NotAuthorizedError} from '@zatickets/common';
import {Order, OrderStatus} from "../models/order";

const router = express.Router();

router.delete('/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const {orderId} = req.params;
    const order = await Order.findById(orderId);

    if(!order){
      throw new NotFoundError();
    }
    if(order.userId !== req.currentUser!.id){
      throw new NotAuthorizedError();
    }

    // To delete the orders means that we mark it as Cancelled
    order.status = OrderStatus.Cancelled;
    await order.save();

    // todo - publish an event saying this order has been cancelled

    res.status(204).send(order);
  });

export {router as deleteOrderRouter};
