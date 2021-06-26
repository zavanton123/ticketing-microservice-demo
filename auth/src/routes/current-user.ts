import express from 'express';
import {currentUser} from '@zatickets/common';

const router = express.Router();

// The idea: if the cookie with JWT exists, than extract user info and return it
// otherwise return null
router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({currentUser: req.currentUser || null});
});

export {router as currentUserRouter};
