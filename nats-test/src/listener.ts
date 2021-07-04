import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from "./events/ticket-created-listener";

// this is to remove the previous output in the console
console.clear();

// each client must have a unique id, so
// we are generating a random id
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
});

stan.on('connect', () => {
  console.log(`zavanton - listener is connected to NATS`);

  // this helps to prevent NATS from waiting for a client
  // from a killed process
  stan.on('close', () => {
    console.log(`zavanton - NATS connection closed`);
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

// close the NATS client before killing the process
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
