import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import childProcess from 'child_process';
import { promisify } from 'util';
import coreRqlite from './coreRqlite';
import config from './config/config.json';
const exec = promisify(require('child_process').exec);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import types from './types';

const app = express();
const port = 5100;

app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
  let decoded;
  try {
    decoded = jwt.verify(req.headers.token as string, config.secret);
  } catch (err) {
    res.status(401).send('Unauthorized');
    return;
  }
  const user = await coreRqlite.query([['SELECT * FROM user WHERE id = ?', decoded.id]]);
  if (user.toArray().length === 0) {
    res.status(401).send('Unauthorized');
  } else {
    req.user = user.toArray()[0];
    next();
  }
});

app.post('/shell_command', async (req, res) => {
  const command = req.body.command;
  const result = await exec(command);
  res.send(result);
});  

fs.readdirSync(__dirname + '/modules').forEach((file) => {
  if (fs.existsSync(__dirname + '/modules/' + file + '/index.ts')) {
    const module = require(__dirname + '/modules/' + file);
    module.default(app);
  }
});

export const createToken = userId => jwt.sign({ id: userId }, config.secret);

export const megapolosPath = __dirname;

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  const query = `
    SELECT u.* FROM user u
    LEFT JOIN group_user g ON g.id = u.group_user_id
    WHERE g.name = ?
  `;
  let admin = await coreRqlite.query([[query, 'root']]);
  if (!admin.toArray().length) {
    admin = await coreRqlite.execute([['INSERT INTO user (id, name, group_user_id ) VALUES (?, ?, ?)', uuidv4(), 'root', 'root']]);
    admin = await coreRqlite.query([[query, 'root']]);
  }
  console.log(createToken(admin.toArray()[0].id));
});
