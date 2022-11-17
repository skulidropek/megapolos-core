import { Express } from  'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config.json';
import coreRqlite from '../../coreRqlite';
import { UserInput } from '../../types';

const users = (app:Express) => {
  app.post('/users/add', async (req, res) => {
    const id = uuidv4();
    const input = req.body as UserInput;
    
    await coreRqlite.execute([['INSERT INTO user (id, name, group_user_id) VALUES (?, ?, ?)', id, input.name, 'user']]);
    res.send({ 'result': 'ok' });
  });

  app.post('/users/list', async (req, res) => {
    console.log(req.user);
    const results = (await coreRqlite.query(`
    SELECT u.*, u.group_user_id as role FROM user u
    LEFT JOIN group_user g ON g.id = u.group_user_id
    `)).toArray();
    results.forEach((result) => {
      result.token = jwt.sign({ id: result.id }, config.secret);
    });
    res.send(results);
  });
};

export default users;