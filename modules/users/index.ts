import { Express } from  'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config.json';
import coreRqlite from '../../coreRqlite';
import { UserInput } from '../../types';
import { UserTable } from '../models/tables';
import UserModel from '../models/user.model';

const users = (app:Express) => {
  app.post('/users/add', async (req, res) => {
    try {
      const id = uuidv4();
      const input = req.body as UserInput;
    
      await UserModel.createUser({ id, name: input.name, groupUserId: 'name' });
      res.send({ 'result': 'ok' });
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });

  app.post('/users/list', async (req, res) => {
    try {
      console.log(req.user);
      const results:(UserTable & { token?: string })[] = await UserModel.getUsers();
      results.forEach((result) => {
        result.token = jwt.sign({ id: result.id }, config.secret);
      });
      res.send(results);
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: e,
      });
    }
  });
};

export default users;