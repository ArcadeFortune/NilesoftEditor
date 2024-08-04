const fs = require('fs');

//possible sections
const SECTIONS = [
  'item',
  'menu'
]

//possible options
const OPTIONS = [
  {sep: 'both'},
  {vis: 'key.shift()'}
]

const path = "D:\\alessio\\Programs\\Nilesoft Shell\\imports\\taskbar.nss"
const shellPath = 'D:\\alessio\\Programs\\Nilesoft^ Shell\\shell.exe' //spaces needs to be escaped with ^
//input needs to know the exact position where the new entry should be inserted
const INPUT_POSITION = 22;
const INPUT_SECTION = 'item';
const INPUT_TITLE = 'Riot Games';
const INPUT_IMAGE_PATH = '"D:\\Riot Games\\Riot Client\\RiotClientServices.exe"';
const INPUT_CMD = 'rito.bat';
const INPUT_OPTIONS = {sep: 'both'};


/**
 * Function to validate
 * @param {number} position 0-based index of the position where the new entry should be inserted
 * @param {string} section must contain a valid section type
 * @param {string} title name of the entry 
 * @param {string} imagePath path of a .ico file or the path of an executable
 * @param {string} cmd command to execute
 * @param {Object} options additional options like 'sep' or 'vis'
 * @returns {boolean} true if the input is valid, or a string with the error message
 */
function validateInput(input) {
  if (!input) return
  if (!input.section) return ('invalid input')
  if (input.position < 0) return ('Invalid position: ' + input.position);
  if (!SECTIONS.includes(input.section)) return ('Invalid section: ' + input.section);
  if (!input.title) input.title = 'noTitle';
  if (!input.cmd) return ('No command specified: ' + input.cmd);
  //todo options validation
  return true;
}
/**
 * Function to calculate the number of indents for a new entry
 * @param {number} position 0-based index of the position where the new entry should be inserted
 * @returns {number} the number of indents to be added before the new row
 */
function calculateIndents(position) {
  if (position === 0) return 0;

  let indents = 0
  //read the file content
  const data = fs.readFileSync(path, 'utf8');

  //split the file content into lines
  const lines = data.split('\n');

  //look at the line before the position
  const previousLine = lines[position - 1];

  //how many indents does this line have?
  indents = previousLine.split('\t').length - 1;

  //add or remove indents
  if (previousLine.includes('{')) indents++;
  return indents
}
/**
 * Function to create a text string for a new entry
 * @param {number} indents number of tabs to be added before the new row
 * @param {string} section must contain a valid section type
 * @param {string} title name of the entry 
 * @param {string} imagePath path of a .ico file or the path of an executable
 * @param {string} cmd command to execute
 * @param {Object} options additional options like 'sep' or 'vis'
 * @returns {String} the text string to be inserted in the file
 */
function createTextString(indents=0, input) {
  let result = '';
  const tabs = '\t'.repeat(indents)
  const newLine = '\n'

  //indentation
  result += tabs

  //create the text string
  result = `${input.section}(title='${input.title}' image='${input.imagePath}' `;

  //command
  if (input.section === 'item') result += `cmd='${input.cmd}' `;

  //additional options
  if (input.sep) result += `sep=${input.sep} `;
  if (input.vis) result += `vis=${input.vis} `;

  result += ')';

  //menu
  if (input.section === 'menu') result += newLine + tabs + '{' + newLine + tabs + '}';

  return result
}
/**
 * Function to add a new row in a text file at a specified position.
 * @param {string} filePath - The path to the text file.
 * @param {string} text - The new row text to be inserted.
 * @param {number} position - The position where the new row should be inserted (0-based index).
 * @param {number} indents - The number of tabs to be added before the new row.
 */
function addRow(filePath, text, position, indents=0) {
  // Read the file content
  try {
    // Read the file content
    const data = fs.readFileSync(filePath, 'utf8');

    // Split the file content into lines
    const lines = data.split('\n');

    // Insert the new row at the specified position
    lines.splice(position, 0, '\t'.repeat(indents) + text);

    // Join the lines back into a single string
    const updatedData = lines.join('\n');

    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedData, 'utf8');
    console.log('Row added successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

/**
 * Function to apply the changes by registering the new entry and restarting the shell.
 * Asks for administrator privileges.
 */
function applyChanges() {
  const { exec } = require('child_process');  
  const command = `${shellPath} -register -restart`
  console.log(`executing command: $ ${command}`);
  exec(`powershell -Command "Start-Process cmd -ArgumentList '/c ${command}' -Verb RunAs"`);
}

/**
 * Function to convert a row string from a .nss file to a json object.
 * @param {String} rowString row as a string from a .nss file
 * @returns {Object} a json object with the row content
 */
function convertRowToJson(rowString='') {
  let temp = rowString.trim().split('item(');
  let content;
  let type;
  let result = {};
  if (temp.length > 1) {
    //its an item
    type = 'item'
  }
  else {
    //its a menu
    temp = temp.join('').split('menu(');
    type = 'menu';
  }


  result[type] = [];
  content = temp[1];
    let fragmented;
    fragmented = content.split('=');

    for (let i = 1; i < fragmented.length; i++) {
      const currentString = fragmented[i];
      const prevString = fragmented[i - 1];
      const lastSpaceIndex = currentString.lastIndexOf(' ')
      const prevLastSpaceIndex = prevString.lastIndexOf(' ');

      // Split the string into two parts: before the last space and after the last space
      const firstPart = currentString.substring(0, lastSpaceIndex) || currentString.slice(0, -1);;
      const secondPart = currentString.substring(lastSpaceIndex + 1);
      const prevFirstPart = prevString.substring(0, prevLastSpaceIndex);
      const prevSecondPart = prevString.substring(prevLastSpaceIndex + 1);

      //save a result
      const obj = {};
      obj[prevSecondPart] = firstPart;
      result[type].push(obj);
    }
  return result;
}
/**
 * function to process the lines of a .nss file and convert them to json objects
 * @param {Array} lines array of strings representing the lines of a .nss file
 * @returns {Array} an array of json objects representing the content of the file
 */
function processLines(lines=[]) {
  const result = [];
  let i = 0;

  function parseBlock() {
      const block = [];
      while (i < lines.length) {
          let line = lines[i].trim();
          if (line === '{') {
              i++;
              block[block.length - 1].menu.push({children: parseBlock()})
              // block[block.length - 1].children = parseBlock(); //less nested
          } else if (line === '}') {
              i++;
              return block;
          } else {
              block.push(convertRowToJson(line));
              i++;
          }
      }
      return block;
  }

  result.push(...parseBlock());
  return result;
}

//start http server
const http = require('http');
const querystring = require('querystring');
const port = 65535;
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
const server = http.createServer(async (req, res) => {
  if (req.url === '/favicon.ico') return;
  console.log('got new connection', req.url);

  if (req.url === '/test') {
    if (req.method === 'POST') {
      await parseBody(req);
      const input = req.body;
      
      // main logic
      const ok = validateInput(input);
      if (ok === true) {
        const indents = calculateIndents(input.position);
        const text = createTextString(indents, input);
        addRow(path, text, input.position, indents);
      }
      else {
        console.error('error:', ok);
      }
      res.end('<h1>hehehehaw</h1>')
    }
    return;
  }

  if (req.url === '/apply') {
    applyChanges();
    res.end()
    return;
  }

  //every other url
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(fs.readFileSync('index.html'));
});

// server.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}/`);
// });


// Read the file content
const data = fs.readFileSync(path, 'utf8');

// Split the file content into lines
const lines = data.split('\n');

const result = processLines(lines);

console.log(JSON.stringify(result, null, 2));

