import { Order } from "../../models/order";
import { Listener, OrderCreatedEvent, Subjects } from "@zatickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";

// When an order is created in the orders microservice,
// Create a duplicate order in the payments microservice as well
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version
    });
    await order.save();

    msg.ack();
  }
}
