import mongoose from 'mongoose';
// note: import the reexported OrderStatus
import { Order, OrderStatus } from "./order";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  // used by optimistic concurrency control
  version: number;

  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;

  // used by optimistic concurrency control
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

// setup optimistic concurrency control
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// This is for optimistic concurrency control
// (i.e. find by the specific id and specific version number)
ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
}

ticketSchema.methods.isReserved = async function () {
  // this === the ticket document we just called 'isReserved()' on
  let ticket = this as TicketDoc

  // Run query to look at all orders. Find an order where the ticket
  // is the ticket we just found and the order status is not cancelled
  // If such an order is found, then the ticket is reserved.
  const existingOrder = await Order.findOne({
    ticket: ticket,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ],
    },
  });

  return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
