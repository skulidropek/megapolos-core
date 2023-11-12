/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { DataApiClient } from 'rqlite-js'
const { exec } = require("child_process");
const fs = require('fs');


//Usage with Node.js's cluster module

const dataApiClient = new DataApiClient('http://localhost:4001')

try {
  const sql = fs.readFileSync('./newrqlite.sql', 'utf8');
  const dataResults = await dataApiClient.execute(sql)

  if (dataResults.hasError()) {
    const error = dataResults.getFirstError()
    console.trace(error, 'rqlite create tables results contained an error.')
    return
  }

  const { statusCode, body } = await dataApiClient.execute(sql, { raw: true })
  console.log(body, 'HTTP reponse body.')
  console.log(statusCode, 'HTTP response code.')
} catch (e) {
  console.trace(e, 'The HTTP client got an HTTP error, there must be something else going on.')
}

// старт сервера
exec("forever start server.js ", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});



