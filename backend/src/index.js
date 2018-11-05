const cookieParser = require('cookie-parser');
require('dotenv').config({path: 'variables.env'});
const jwt = require('jsonwebtoken');
const createServer = require('./createServer');
const db = require('./db');


const server = createServer();


//a faire /// express middleware pour cookies(jwt)
server.express.use(cookieParser());//formate les cookies dans un obj

//DECODER LE TOKEN POUR AVOIR LE USER ID
server.express.use((req,res, next) => {
  //console.log('j vais poper a chaque request (si y a une query sur la page)') // 4 fois pour 4 items sur /produits.
  //sortir le token (j ai nommé Axetoken dans la mutation resolver, oui Ben t es bad ass)
   const { AxeToken } = req.cookies ;
   if(AxeToken){
     const { userId } = jwt.verify( AxeToken, process.env.APP_SECRET );
     // console.log(userId)
     // mettre le userId sur le req.
     req.userId = userId;
   }
   //console.log(Axetoken)

  next();
});

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
