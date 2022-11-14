import { Express } from  'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config.json';
import coreRqlite from '../../coreRqlite';

const users = (app:Express) => {
  app.post('/users/add', async (req, res) => {
    const id = uuidv4();
    
    await coreRqlite.execute([['INSERT INTO user (id, name, role) VALUES (?, ?, ?)', id, req.body.name, 'user']]);
    res.send({ 'result': 'ok' });
  });

  app.post('/users/list', async (req, res) => {
    const results = (await coreRqlite.query('SELECT * FROM user')).toArray();
    results.forEach((result) => {
      result.token = jwt.sign({ id: result.id }, config.secret);
    });
    res.send(results);
  });
};

export default users;