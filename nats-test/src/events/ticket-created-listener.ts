import {Message} from 'node-nats-streaming';
import {Listener} from "./base-listener";

export class TicketCreatedListener extends Listener {
  subject: string = 'ticket:created'
  queueGroupName: string = 'payments-service'

  onMessage(data: any, msg: Message): void {
    console.log(`zavanton - event data`, data);
    // send back the ack manually
    // when the message is processed successfully
    msg.ack();
  }
}
