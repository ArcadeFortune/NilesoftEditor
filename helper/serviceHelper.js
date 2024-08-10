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

//possible files
const FILES = [
  'taskbar',
]

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
function validateInput(input, contextMenu) {
  if (!input) return
  if (!input.section && input.section === '') return ('invalid input')
  if (contextMenu && !FILES.includes(contextMenu)) return ('Invalid file: ' + contextMenu);
  if (input.position < 0) return ('Invalid position: ' + input.position);
  if (!SECTIONS.includes(input.section)) return ('Invalid section: ' + input.section);
  if (!input.title) input.title = 'noTitle';
  if (!input.cmd) return ('No command specified: ' + input.cmd);
  //todo options validation
  return true;
}

module.exports = {
  validateInput
}