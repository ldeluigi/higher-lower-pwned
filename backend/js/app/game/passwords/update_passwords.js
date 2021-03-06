const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const fsPromises = fs.promises;
const csv = require('async-csv');
const cliProgress = require('cli-progress');

const folder = __dirname;
const debug = false;
const readBufferLimit = 100;
const forceUpdate = true;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    console.log("Started...");
    await main();
    console.log("Done.");
  } catch (e) {
    console.error(e);
  }
})();

async function main() {
  const multibar = new cliProgress.MultiBar({
    format: '{bar} | {filename} | {percentage}% | Duration: {duration_formatted} | ETA: {eta_formatted} | {value}/{total}',
    etaAsynchronousUpdate: true,
    etaBuffer: 10000,
    notTTYSchedule: 60000,
    noTTYOutput: true,
    fps: 1
  }, cliProgress.Presets.shades_classic);
  try {
    let files = (await fsPromises.readdir(folder)).filter(f => f.endsWith(".txt"));
    let bars = files.map(f => multibar.create(fs.readFileSync(path.join(folder, f)).length, 0, { filename: f }));
    for (const [i, file] of files.entries()) {
      let bar = bars[i];
      // Make one pass and make the file complete
      var filePath = path.join(folder, file);
      try {
        await startUpdating(filePath, n => bar.increment(n));
      } catch (err) {
        bar.stop()
        console.error(err);
        break;
      }
      bar.stop()
    }
    multibar.stop();
  } catch (err) {
    multibar.stop();
    console.error("Could not list the directory.", err);
    throw err;
  }
}


async function startUpdating(f, parseCalback = n => {}) {
  if (!f.endsWith(".txt")) {
    throw new Error("Provided non txt file!");
  }
  let asCSV = f.replace(new RegExp("\.txt$"), ".csv");
  let skipMap = new Map();
  if (!forceUpdate && true == fs.existsSync(asCSV)) {
    let csvRes = await csv.parse(await fsPromises.readFile(asCSV));
    csvRes.shift();
    skipMap = csvRes.reduce((map, obj) => {
      map.set(obj[0], {
        hash: obj[1],
        number: obj[2]
      });
      return map;
    }, new Map());
  }
  await fsPromises.writeFile(asCSV, "password,hash,number\n");
  const readInterface = readline.createInterface({
    input: fs.createReadStream(f),
  });
  let readCount = 0;
  let readBuffer = [];
  for await (const line of readInterface) {
    let trimLine = line.trim();
    if (skipMap.has(trimLine)) {
      let result = skipMap.get(trimLine);
      result.password = trimLine;
      await fsPromises.appendFile(asCSV,
        result.password + "," +
        result.hash + "," +
        result.number + "\n");
      if (debug)
        console.log("Skipped: ", result);
      skipMap.delete(trimLine);
    } else {
      readBuffer.push(trimLine);
      readCount++;
      if (readCount >= readBufferLimit) {
        for await (const result of readBuffer.map(s => downloadPasswordData(s))) {
          await fsPromises.appendFile(asCSV,
            result.password + "," +
            result.hash + "," +
            result.number + "\n");
          if (debug)
            console.log(result);
        }
        delay(100);
        readBuffer = [];
        readCount = 0;
      }
    }
    parseCalback(line.length + 1);
  }
  for await (const result of readBuffer.map(s => downloadPasswordData(s))) {
    await fsPromises.appendFile(asCSV,
      result.password + "," +
      result.hash + "," +
      result.number + "\n");
    if (debug)
      console.log(result);
  }
}

function downloadPasswordData(password, retry = 3) {
  return new Promise((resolve, reject) => {
    let pSHA1 = sha1(password).toUpperCase();
    let shaBeginning = pSHA1.substr(0, 5);

    const options = {
      hostname: 'api.pwnedpasswords.com',
      port: 443,
      path: '/range/' + shaBeginning,
      method: 'GET',
      timeout: 60 * 1000
    };
    const req = https.request(options, res => {
      let str = '';
      res.on('data', d => {
        str += d;
      });
      res.on('end', () => {
        let results = str
          .replace("\r", "")
          .split("\n")
          .map(x => x.split(":"))
          .filter(x => shaBeginning + x[0] == pSHA1)
          .map(x => x[1]);
        if (results.length > 1) {
          throw new Error("Multiple matches on " + password);
        } else if (results.length == 0) {
          resolve({
            password: password,
            hash: pSHA1,
            number: 0
          });
        } else {
          resolve({
            password: password,
            hash: pSHA1,
            number: parseInt(results[0])
          });
        }

      });
    })

    req.on('error', error => {
      reject(error);
    });
    req.end();
  }).catch(reason => {
    if (retry > 0) {
      return downloadPasswordData(password, retry - 1);
    }
    throw new Error(password + ':::' + reason);
  });
}


function sha1(input) {
  let shasum = crypto.createHash('sha1');
  shasum.update(input);
  return shasum.digest('hex');
}
