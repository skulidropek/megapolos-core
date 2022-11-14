import express from 'express';
import coreRqlite from './coreRqlite.js';

const app = express();
const port = 5100;

app.get('/', (req, res) => {
  res.send({ hello: 'world' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
