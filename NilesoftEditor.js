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
function validateInput(position, section, title, imagePath, cmd, options) {
  if (position < 0) return ('Invalid position: ' + position);
  if (!SECTIONS.includes(section)) return ('Invalid section: ' + section);
  if (!title) title = 'noTitle';
  if (!cmd) return ('No command specified: ' + cmd);
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
function createTextString(indents=0, section, title='noTitle', imagePath, cmd, options) {
  let result = '';
  const tabs = '\t'.repeat(indents)
  const newLine = '\n'

  //indentation
  result += tabs

  //create the text string
  result = `${section}(title='${title}' image='${imagePath}' `;

  //command
  if (section === 'item') result += `cmd='${cmd}' `;

  //additional options
  if (options.sep) result += `sep=${options.sep} `;
  if (options.vis) result += `vis=${options.vis} `;

  result += ')';

  //menu
  if (section === 'menu') result += newLine + tabs + '{' + newLine + tabs + '}';

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


// main logic
const ok = validateInput(INPUT_POSITION, INPUT_SECTION, INPUT_TITLE, INPUT_IMAGE_PATH, INPUT_CMD, INPUT_OPTIONS);
if (ok !== true) return console.error(ok);
const indents = calculateIndents(INPUT_POSITION);
const text = createTextString(indents, INPUT_SECTION, INPUT_TITLE, INPUT_IMAGE_PATH, INPUT_CMD, INPUT_OPTIONS);
addRow(path, text, INPUT_POSITION, indents);
applyChanges();

