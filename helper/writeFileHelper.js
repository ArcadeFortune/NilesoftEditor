const fs = require('fs')

/**
 * Function to calculate the number of indents for a new entry
 * @param {number} position 0-based index of the position where the new entry should be inserted
 * @returns {number} the number of indents to be added before the new row
 */
function calculateIndents(path, position) {
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

module.exports = {
  calculateIndents,
  createTextString,
  addRow
}