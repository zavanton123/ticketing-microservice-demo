import { Listener, PaymentCreatedEvent, Subjects } from '@zatickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from "./queue-group-name";
import { Order, OrderStatus } from "../../models/order";

// When the order has been paid, make its status 'complete'
export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // When successful payment event is received,
    // we mark the order as completed
    order.set({ status: OrderStatus.Complete });
    await order.save();

    // send the ack that the event has been successfully processed
    msg.ack();
  }
}
