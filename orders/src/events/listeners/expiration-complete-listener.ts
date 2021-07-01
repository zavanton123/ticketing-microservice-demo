import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from '@zatickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName: string = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    // if the order has already been paid for, just return ack
    if(order.status === OrderStatus.Complete){
      return msg.ack();
    }

    // When the expiration:complete event is received,
    // we make the order cancelled
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    // inform the other microservices that the order has been cancelled
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    });

    msg.ack();
  }
}
