import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import {errorHandler, NotFoundError, currentUser} from '@zatickets/common';
import cookieSession from 'cookie-session';
import {createTicketRouter} from "./routes/new";
import {showTicketRouter} from "./routes/show";
import {indexTicketRouter} from "./routes";
import {updateTicketRouter} from "./routes/update";

const app = express();

// we need 'trust proxy' because we are using ingress-nginx
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
  // http is used for testing, https is used for production
  secure: process.env.NODE_ENV !== 'test'
}))
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

// global error handler for the auth microservice
app.use(errorHandler);

export {app};
