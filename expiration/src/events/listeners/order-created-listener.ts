import { Listener, OrderCreatedEvent, Subjects } from '@zatickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

// When order created event is received, add its info to expiration queue
// with the delay (after which the expiration event is published)
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`zavanton - waiting for ${ delay } millisec to finish the job`);

    await expirationQueue.add(
      { orderId: data.id },
      { delay }
    );

    msg.ack();
  }
}
