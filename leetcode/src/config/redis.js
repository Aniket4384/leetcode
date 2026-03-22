const { createClient }  = require('redis');
const redisClient = createClient({
    username: 'default',
    password: 'a8As5njQAPMhuFOAaEltPUXByFxhpg3P',
   socket: {
        host: 'redis-13705.c44.us-east-1-2.ec2.cloud.redislabs.com',
        port: 13705
    }
});
module.exports = redisClient