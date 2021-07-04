import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";
import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@zatickets/common";
import { Message } from "node-nats-streaming";

// When a order is cancelled in the orders microservice,
// update the status of this order to 'cancelled' in payments microservice as well
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // find by id and version
    // if the version is not correct, the event is rejected
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Make the order 'cancelled'
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
