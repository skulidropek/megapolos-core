import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import UserModel from '../models/user.model';
import config from '../../config/config.json';

const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
  let decoded: JwtPayload & { id: string };
  try {
    decoded = jwt.verify(req.headers.token as string, config.secret) as JwtPayload & { id: string };
  } catch (err) {
    res.status(401).send('Unauthorized');
    return;
  }
  const user = await UserModel.getUserById(decoded.id);
  if (!user) {
    res.status(401).send('Unauthorized');
  } else {
    req.user = user;
    next();
  }
};

export default authMiddleware;