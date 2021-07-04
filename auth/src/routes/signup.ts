import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@zatickets/common';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Users with the same email are not allowed
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    // create a new user
    const user = User.build({ email, password });
    await user.save();

    // create JWT
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
      },
      // the ! is used to avoid typescript checks
      process.env.JWT_KEY!
    )

    // store the JWT into cookie
    req.session = { jwt: userJwt };
    res.status(201).send(user);
  });

export { router as signupRouter };
