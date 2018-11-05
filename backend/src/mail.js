const nodemailer = require('nodemailer');
require('dotenv').config({path: 'variables.env'});

var transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

///un email tres leger ...
const makeANiceEmail = (text) => `
  <div className="email" style="
    border: 1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2:
    font-size: 20px;
    ">
    <h2>Bonjour!</h2>
    <p>${text}</p>
    <p>Merci!</p>
  </div>
`;

exports.transport = transport;
exports.makeANiceEmail = makeANiceEmail;
