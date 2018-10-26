
require('dotenv').config({path: 'variables.env'});
const createServer = require('./createServer');
const db = require('./db');


const server = createServer();


//a faire /// express middleware pour cookies(jwt)

//a faire /// express middleware pour polpuler current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  (deets) => console.log( `Server is running on ${deets.port}`)
);
