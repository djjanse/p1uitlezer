#!/home/djanse/bin/node
var serialport = require("serialport");
var moment = require("moment");
var fs = require('fs');

// TODO: change filename to date + name
var currentDir = __dirname;
var datestamp = "";
var dataDir = "data";
var writeStream = null;

var SerialPort = serialport.SerialPort; // localize object constructor
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600, 
  databits:7, 
  parity:"even", 
  stopbits: 1, 
  xon: 0, 
  xoff: 0, 
  rtscts: 0,
  parser: serialport.parsers.readline("!")
});

serialPort.on("open", function () {
  console.log("Opened P1 port");
  serialPort.on("data", function(data) {
    var exportData = [];
    var timestamp = moment().unix();
    exportData.push(timestamp);
    //console.log(data);
    var lines = data.split("\n");
    lines.forEach(function(line, i) {
      // get meter type
      var meterType = getStringBetween(line,":","(");
      // get meter value (valid for electricity consumption values)
      var meterValue = getStringBetween(line,"(","*");
      switch(meterType){
        case "1.8.1":
          //console.log("afgenomen_hoog\t" + meterValue);
          exportData.push(convertToIntegerValue(meterValue));
          break;
        case "1.8.2": 
          //console.log("afgenomen_laag\t" + meterValue);
          exportData.push(convertToIntegerValue(meterValue));
          break;
        case "2.8.1":
          //console.log("geleverd_hoog\t" + meterValue);
          exportData.push(convertToIntegerValue(meterValue));
          break;
        case "2.8.2":
          //console.log("geleverd_laag\t" + meterValue);
          exportData.push(convertToIntegerValue(meterValue));
          break;
        case "96.14.0":
          meterValue = "" + getStringBetween(line,"(",")");
          //console.log("actueel_tarief\t" + (meterValue === "0001" ? "laag" : "hoog"));
          exportData.push(meterValue === "0001" ? "l" : "h");
          break;
        case "1.7.0":
          //console.log("huidig_verbruik\t" + meterValue);
          // *10 to convert current consumption in W
          exportData.push(convertToIntegerValue(meterValue)*10);
          break;
        case "2.7.0":
          //console.log("huidig_levering\t" + meterValue);
          // *10 to convert current consumption in W
          exportData.push(convertToIntegerValue(meterValue)*10);
          break;
        case "96.13.1":
          meterValue = getStringBetween(line,"(",")");
          //console.log("bericht_num\t" + meterValue);
          exportData.push(meterValue);
          break;
        case "96.13.0":
          meterValue = getStringBetween(line,"(",")");
          //console.log("bericht_tekst\t" + meterValue);
          exportData.push(meterValue);
          break;
        default:
          // unknown meter type
          //console.log("unknown: " + line);
      }

    });
    
    //console.log(exportData);
    if (exportData.length === 10){
        // export only valid p1 messages (where we could find all our wanted information)
	// timestamp, 1.8.1, 1.8.2, 2.8.1, 2.8.2, 
        var line = exportData.join(",");
        // TODO: write to rotated file
        var currentDatestamp = moment().format('YYMMDD');
        if (currentDatestamp > datestamp){
          if (writeStream){
            writeStream.end();
          }
          datestamp = currentDatestamp;
          var dir = currentDir + "/" +dataDir + "/" + datestamp +'_verbruik.csv';
          console.log('writing to: ' + dir);

          writeStream = fs.createWriteStream(dir, { flags : 'a+' });
        }
        writeStream.write(line + "\n");
    }
    //       - sla op als csv (oid)
  });
});

serialPort.on("error", function (data) {
    console.log("@" + moment().format() + ": Error reading p1 port: " + data);
});

function getStringBetween(data, charLeft, charRight){
  return data.substring(data.indexOf(charLeft)+1,data.indexOf(charRight));
}

function convertToIntegerValue(value){
    return parseInt(value.replace(/\./,''), 10);
}

