const shellPath = 'D:\\alessio\\Programs\\Nilesoft^ Shell\\shell.exe' //spaces needs to be escaped with ^
const taskbarPath = "D:\\alessio\\Programs\\Nilesoft Shell\\imports\\taskbar.nss"

const { validateInput } = require('../helper/serviceHelper');
const { calculateIndents, createTextString, addRow } = require('../helper/writeFileHelper');
const { JSONifyFile } = require('../helper/readFileHelper');
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
 * Function to add an entry to a file
 */
function addEntry(input, contextMenu) {  
  const ok = validateInput(input, contextMenu);
  if (ok === true) {
    const indents = calculateIndents(taskbarPath, input.position);
    const text = createTextString(indents, input);
    addRow(taskbarPath, text, input.position, indents);
  } else {
    throw new Error(ok);
  }
}

function getJSON(file) {
  return JSONifyFile(taskbarPath);
}

module.exports = {
  applyChanges,
  addEntry,
  getJSON,
}