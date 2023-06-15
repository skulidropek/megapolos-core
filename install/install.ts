/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync, rmSync, existsSync, rmdirSync } from 'fs';
import { sleep } from '..';
import rqlite from '../coreRqlite';

(async () => {
    const exec = commands => commands.map(command => spawnSync(command, {
        shell: true,
        stdio: 'inherit',
    }));
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    exec([
        'killall rqlited',
        'rm -rf ~/node.1',
    ])

    exec([
        'curl -L https://github.com/rqlite/rqlite/releases/download/v7.13.1/rqlite-v7.13.1-linux-amd64.tar.gz -o rqlite-v7.13.1-linux-amd64.tar.gz',
        'tar xvfz rqlite-v7.13.1-linux-amd64.tar.gz',
        'ln -s rqlite-v7.13.1-linux-amd64 rqlite',
        'rqlite/rqlited ~/node.1 > /dev/null &',
        'sudo npm i -g nodemon ts-node',
    ]);

    mkdirSync(__dirname + '/../config');
    writeFileSync(__dirname + '/../config/config.json', `{
        "secret": "test"
    }`);

    const db = readFileSync(__dirname + '/newrqlite.sql').toString('utf-8');

    try {
        await sleep(4000);
        await rqlite.execute(db);
    } catch (e) {
        console.error(e);
    }
})();