const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());

let Files = {};

app.post("/startUpload", (req, res, next) => {
  if (!fs.existsSync("FileStorage/")) fs.mkdirSync("FileStorage/");
  Files[req.body.name] = {
    fileSize: req.body.fileSize,
    download: 0,
    buffer: 0,
    place: 0
  };
  try {
    const Stat = fs.statSync("FileStorage/" + req.body.name);
    if (Stat.isFile()) {
      Files[req.body.name]["download"] = Stat.size;
      Files[req.body.name]["place"] = Stat.size / 1024000;
    }
  } catch (err) {}
  fs.open("FileStorage/" + req.body.name, "a", 0755, (err, fdata) => {
    if (err) return console.log(err.message);
    Files[req.body.name]["Handler"] = fdata;
    res.send([
      "More_data",
      {
        place: Files[req.body.name]["place"],
        download: Files[req.body.name]["download"]
      }
    ]);
  });
});

app.post("/continueUpload", (req, res) => {
  console.log(req.body);
  const Name = req.body.name;
  Files[Name]["download"] += req.body.chunk.length;
  Files[Name]["data"] += req.body.chunk;
  if (Files[Name]["download"] == Files[Name]["filesize"]) {
    fs.write(
      Files[Name]["Handler"],
      Files[Name]["data"],
      null,
      "Binary",
      function(err, Writen) {
        res.send(["Done"]);
      }
    );
  } else if (Files[Name]["data"].length >= 10240000) {
    Files[Name]["data"] = "";
    fs.write(
      Files[Name]["Handler"],
      Files[Name]["data"],
      null,
      "Binary",
      function(err, Writen) {
        res.send(["More_data"]);
      }
    );
  } else {
    var place = Files[Name]["download"] / 1024000;
    console.log(place);
    // var Percent = (Files[Name]["Downloaded"] / Files[Name]["FileSize"]) * 100;
    res.send(["More_data", { place: place }]);
  }
});

app.listen(5200, () => {
  console.log("server is running at 5200");
});
