const querystring = require('querystring');

const parseBody = async (req) => {
  //fills req.body with the parsed json
  return new Promise((resolve, reject) => {
    req.body = '';
    req.on('data', chunk => {
      req.body += chunk.toString();
    })
    req.on('end', () => {
      // if (!req.body) resolve();
      // else {
      if (req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        req.body = querystring.parse(req.body);
      } else if (req.headers['content-type'].includes('application/json')) {
        req.body = JSON.parse(req.body);
      }
      // }
      resolve();
    })
  })
}

module.exports = {
  parseBody
}