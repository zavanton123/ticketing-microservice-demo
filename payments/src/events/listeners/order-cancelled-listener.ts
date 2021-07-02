import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";
import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@zatickets/common";
import { Message } from "node-nats-streaming";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ orderStatus: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
