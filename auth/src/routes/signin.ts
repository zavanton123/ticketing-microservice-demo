import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {validateRequest} from "../../../common/src/middlewares/validate-request";
import {User} from "../models/user";
import {BadRequestError} from "../../../common/src/errors/bad-request-error";
import {Password} from "../services/password";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {email, password} = req.body;

    // extract the user with this email from the DB
    const existingUser = await User.findOne({email});
    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials');
    }

    // compare the passwords
    const passwordsMatch = await Password.compare(existingUser.password, password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid Credentials');
    }

    // create JWT
    const userJwt = jwt.sign({id: existingUser.id, email: existingUser.email},
      // the ! is used to avoid typescript checks
      process.env.JWT_KEY!
    )

    // store the JWT into cookie
    req.session = {jwt: userJwt};
    res.status(200).send(existingUser);
  });

export {router as signinRouter};
