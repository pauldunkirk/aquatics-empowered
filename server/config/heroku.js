const url = require('url');
const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth ? params.auth.split(':') : ['', ''];

const config = {
  local: false,
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true
};

console.log("\n\nCONFIG: ", config);

module.exports = config;
