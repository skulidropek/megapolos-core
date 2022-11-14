import { Express } from  'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config.json';
import coreRqlite from '../../coreRqlite';

const users = (app:Express) => {
  app.get('/users/list', async (req, res) => {
    const results = (await coreRqlite.query('SELECT * FROM user')).toArray();
    results.forEach((result) => {
      result.token = jwt.sign({ id: result.id }, config.secret);
    });
    res.send(results);
  });
};

export default users;