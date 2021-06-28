import {Message} from 'node-nats-streaming';
import {Listener} from "./base-listener";
import {TicketCreatedEvent} from "./ticket-created-event";
import {Subjects} from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log(`zavanton - event data`, data);
    // send back the ack manually
    // when the message is processed successfully


    msg.ack();
  }
}
