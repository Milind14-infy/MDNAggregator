var fs = require('fs');
var parse = require('csv-parse');
const folderLocation = './CSV_Files/';

function saveToFile(filename, stringIn) {
    fs.writeFile(filename, stringIn, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function arrayToCSV(array)
{
    var strOut = "";
    for (var i = 0; i < array.length; i++) {
        for(var j = 0; j < array[i].length; j++)
        {
            strOut += array[i][j] + ',';
        }
        strOut += '\n';
    }
    return strOut;
}

function readCSVToArray(inputPath) {
    //Read the csv to array and return a promise containing the array
    p = new Promise(function (resolve, reject) {
        try {
            fs.readFile(inputPath, function (err, fileData) {
                parse(fileData, { columns: false, trim: true }, function (err, rows) {
                    // Your CSV data is in an array of arrys passed to this callback as rows.
                    var array = [];
                    for (var i = 0; i < rows.length; i++) {
                        subArray = [];
                        for (var j = 0; j < rows[0].length; j++) {
                            subArray.push(rows[i][j]);
                        }
                        array.push(subArray);
                    }
                    resolve(array);
                });
            });
        }
        catch (e) {
            reject(e);
        }
    });
    return p;
}


async function readCSVs(folderLocation) {
    p = new Promise(function (resolve, reject) {
        fs.readdir(folderLocation, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            var i = 0;
            //Array of all csvs as arrays
            var arrayOfCSVs = [];
            //For each file read the csv to array and add it to arrayOfCSVs
            files.forEach(function (file) {
                let promiseArray = readCSVToArray(folderLocation + file);
                promiseArray.then(csvArray => {
                    //When the counter reaches the length of files resovle the promise
                    i = i + 1;
                    arrayOfCSVs.push(csvArray);
                    if (i == files.length) {
                        resolve(arrayOfCSVs);
                    }
                })
            });
        });
    });
    return p;
}

async function getArrayOfAllCSVs() {
    return await readCSVs(folderLocation);
}


async function getFirstCols() {
    var allCSVs = await getArrayOfAllCSVs();
    var newArray = [];
    allCSVs.forEach(singleCSV => {
        for (var i = 1; i < singleCSV.length; i++) {
            newRow = [singleCSV[i][0]];
            newArray.push(newRow);
        }
    });
    return newArray;
}

function getLargeLink(array)
{
    var linkBase = "http://saswbbizzap71.sdc.vzwcorp.com:5064/DataFeedWeb/refresh/fixMultipleMtn?function=updateEPService&rosettaStone=6784885176&userId=userid&threads=1&mtnList=";
    for (var i = 0; i < array.length; i++) {
        for(var j = 0; j < array[i].length; j++)
        {
            linkBase += array[i][j] + ',';
        }
    }
    return linkBase;
}

async function main() {
    let arrayOfMTNs = await getFirstCols();

    let csvOfMTNs = arrayToCSV(arrayOfMTNs);
    saveToFile('./output.csv', csvOfMTNs);

    let largeLink = getLargeLink(arrayOfMTNs);
    saveToFile('./activationLink.txt', largeLink);
}

main();