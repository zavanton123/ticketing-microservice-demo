import { Listener } from '@zatickets/common';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, Subjects } from "../../../../common/src";
import { queueGroupName } from "./queue-group-name";
import {expirationQueue} from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    await expirationQueue.add({
      orderId: data.id
    });

    msg.ack();
  }
}
