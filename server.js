const http = require('http');
const fs = require('fs');
const service = require('./services/service');
const { parseBody } = require('./helper/controllerHelper');
const { getFolder } = require('./helper/getFolderHelper');
const port = 65535;

const server = http.createServer(async (req, res) => {
  if (req.url === '/favicon.ico') return;
  if (req.method !== 'GET') await parseBody(req);

  console.log('got new request at: ' + req.url);
  try {
    if (req.url === '/taskbar') {
      switch (req.method) {
        case 'GET':
          const json = service.getJSON('taskbar');
          res.writeHead(200, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify(json));
          break;
        case 'POST':
          service.addEntry(req.body, 'taskbar');
          res.writeHead(302, {
            'Location': '/'
          });
          res.end();
          break;
        default:
          res.end('not found');
      }
      return;
    }

    if (req.url === '/getFolder') {
      switch (req.method) {
        case 'GET':
          const folder = await getFolder();
          res.writeHead(200, {
            'Content-Type': 'application/json'
          });
          res.end(folder);
          break;
        default:
          res.end('not found');
      }
      return;
    }
  
    if (req.url === '/apply') {
      switch (req.method) {
        case 'GET':
          service.applyChanges();
          res.end();
          break;
        default:
          res.end('not found');
      }
      return;
    }
    const requestedFile = req.url.split('/').pop();
    if (fs.existsSync(requestedFile)) {
      res.statusCode = 200;
      res.end(fs.readFileSync(requestedFile));
      return;
    }
      //default
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(fs.readFileSync('./index.html'));
      console.log(requestedFile);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal server error: ' + error);
  }
});


server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});