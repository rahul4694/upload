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
    console.log(Stat);
    if (Stat.isFile()) {
      Files[req.body.name]["download"] = Stat.size;
      Files[req.body.name]["place"] = Stat.size / 1024000;
    }
    console.log(Files[req.body.name]["place"]);
  } catch (err) {
      console.log(err.message)
  }
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

app.post("/continueUpload", (req, res) => {});

app.listen(5200, () => {
  console.log("server is running at 5200");
});
