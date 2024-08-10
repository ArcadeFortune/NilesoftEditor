
const str = '"weird string"';
const str2 = "'weird string2'";

function cleanString(str) {
  return str.replace(/['"]/g, '');
}

console.log(cleanString(str));