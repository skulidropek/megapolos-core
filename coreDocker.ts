/* License: Apache 2.0. https://www.apache.org/licenses/LICENSE-2.0 */

import Docker from 'dockerode';
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export default docker;