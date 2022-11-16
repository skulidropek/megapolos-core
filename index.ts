import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import coreRqlite from './coreRqlite';
import config from './config/config.json';

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
    next();
  }
});

fs.readdirSync(__dirname + '/modules').forEach((file) => {
  if (fs.existsSync(__dirname + '/modules/' + file + '/index.ts')) {
    const module = require(__dirname + '/modules/' + file);
    module.default(app);
  }
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  const admin = await coreRqlite.query([['SELECT * FROM user WHERE role = ?', 'admin']]);
  console.log(jwt.sign({ id: admin.toArray()[0].id }, config.secret));
});
