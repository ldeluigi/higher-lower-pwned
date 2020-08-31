const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const fsPromises = fs.promises;
const csv = require('async-csv');

const folder = "./";

(async () => {
    try {
        await main();
    } catch (e) {
        console.error(e);
    }
})();

async function main() {
    try {
        let files = await fsPromises.readdir(folder);
        for await (const file of files) {
            // Make one pass and make the file complete
            var filePath = path.join(folder, file);
            if (filePath.endsWith(".txt")) {
                await startUpdating(filePath);
            }
        }
    } catch (err) {
        console.error("Could not list the directory.", err);
        throw err;
    }
}


async function startUpdating(f) {
    if (!f.endsWith(".txt")) {
        throw new Error("Provided non txt file!");
    }
    let asCSV = f.replace(new RegExp("\.txt$"), ".csv");
    let skipMap = new Map();
    if (true == fs.existsSync(asCSV)) {
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
    const readInterface = readline.createInterface(({
        input: fs.createReadStream(f),
    }));
    for await (const line of readInterface) {
        let trimLine = line.trim();
        if (skipMap.has(trimLine)) {
            let result = skipMap.get(trimLine);
            result.password = trimLine;
            await fsPromises.appendFile(asCSV,
                result.password + "," +
                result.hash + "," +
                result.number + "\n");
            console.log("Skipped: ", result);
        } else {
            let result = await downloadPasswordData(trimLine);
            await fsPromises.appendFile(asCSV,
                result.password + "," +
                result.hash + "," +
                result.number + "\n");
            console.log(result);
        }
    }
}

function downloadPasswordData(password) {
    return new Promise((resolve, reject) => {
        let pSHA1 = sha1(password).toUpperCase();
        let shaBeginning = pSHA1.substr(0, 5);

        const options = {
            hostname: 'api.pwnedpasswords.com',
            port: 443,
            path: '/range/' + shaBeginning,
            method: 'GET'
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
    });
}


function sha1(input) {
    let shasum = crypto.createHash('sha1');
    shasum.update(input);
    return shasum.digest('hex');
}