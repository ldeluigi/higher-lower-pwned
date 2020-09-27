const fsPromises = require('fs').promises;
const fs = require('fs');
const readline = require('readline');
const path = require('path');


const maxLinesForPasswordFile = 100000;
const directory = __dirname;

const fileMap = [];


module.exports = {
  setup: async function () {
    let passwordFiles = await fsPromises.readdir(__dirname);
    passwordFiles = passwordFiles.filter(fn => fn.endsWith(".csv"));
    if (passwordFiles.length <= 0) throw new Error("Password files missing.");
    for (pfile of passwordFiles) {
      let filePath = path.join(directory, pfile);
      let lineCount = await countLines(filePath);
      if (maxLinesForPasswordFile < lineCount) {
        throw new Error("Password file " + pfile + "has more than " +
          maxLinesForPasswordFile + " lines. Please split it into multiple files.");
      }
      fileMap.push({
        path: filePath,
        lines: lineCount - 1 // first line of csv is useless
      });
    }
  },
  pickPasswordAndValue: async function (wish) {
    let max = fileMap.map(f => f.lines).reduce((a, b) => a + b, 0);
    let pick = wish === undefined ? Math.floor(Math.random() * max) : wish;
    let pickIndex = pick;
    for (let i = 0; i < fileMap.length; i++) {
      if (pick < fileMap[i].lines) {
        let microcsv = await readOneCSVLine(fileMap[i].path, pick);
        let split = microcsv.split(',');
        return {
          index: pickIndex,
          password: split[0],
          value: parseInt(split[2])
        }
      } else {
        pick -= fileMap[i].lines;
      }
    }
    throw new Error("Picked a number that exceeded maximum number of passwords available (" + max + ").");
  }
};

async function countLines(fileName) {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(fileName),
  });
  let i = 0;
  for await (const line of readInterface) {
    if (line.length <= 1) continue;
    i++;
  }
  return i;
}

async function readOneCSVLine(fileName, lineIndex) {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(fileName),
  });
  let i = -1;
  for await (const line of readInterface) {
    if (line.length <= 1) continue;
    if (i == lineIndex) return line;
    i++;
  }
  throw new Error(fileName + " has less than " + lineIndex + " lines.");
}
