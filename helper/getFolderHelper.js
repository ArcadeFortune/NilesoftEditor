const { exec } = require('child_process');
const path = require('path');
//runs getFolder.ps1 and returns its output
function getFolder() {
  return new Promise((resolve, reject) => {
    const command = `powershell -Command ${path.resolve('helper\\getFolder.ps1')}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        reject(error);
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        reject(stderr);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

module.exports = { getFolder };