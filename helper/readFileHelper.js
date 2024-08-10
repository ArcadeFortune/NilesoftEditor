const fs = require('fs')
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

  result[type] = {};
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
    Object.assign(result[type], obj);
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
              Object.assign(block[block.length - 1].menu, {children: parseBlock()})
          } else if (line === '}') {
              i++;
              return block; 
          } else {
              const obj = convertRowToJson(line);
              if (obj.item) Object.assign(obj.item, {index: i});
              else Object.assign(obj.menu, {index: i});
              block.push(obj);
              i++;
          }
      }
      return block;
  }

  result.push(...parseBlock());
  return result;
}

function JSONifyFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');

  const lines = data.split('\n');

  const result = processLines(lines);
  return result
}

module.exports = {
  JSONifyFile
}