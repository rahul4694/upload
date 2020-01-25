const express = require("express")
, socketapp = require("http").createServer()
, io = require("socket.io").listen(socketapp)
, app = express()
, fs = require("fs");

socketapp.listen(8000);
app.use(express.json());

let Files = {};

io.sockets.on("connection", function(socket) {
  socket.on("startUpload", data => {
    if (!fs.existsSync("FileStorage/")) fs.mkdirSync("FileStorage/");
    const Name = data.name;
    Files[Name] = {
      fileSize: data.fileSize,
      download: 0,
      buffer: ""
    };
    try {
      const Stat = fs.statSync("FileStorage/" + Name);
      if (Stat.isFile()) {
        Files[Name]["download"] = Stat.size;
        Files[Name]["place"] = Stat.size / 1024000;
      }
    } catch (err) {}

    fs.open("FileStorage/" + Name, "a", 0755, (err, fdata) => {
      if (err) return console.log(err.message);
      Files[Name]["Handler"] = fdata;
      socket.emit("More_data", {
        place: Files[Name]["place"],
        downloaded: Files[Name]["download"]
      });
    });
  });

  socket.on("cancel", data => {
    fs.unlink(`FileStorage/${data.name}`, () => {});
  });

  socket.on("continueUpload", data => {
    const Name = data.name;
    Files[Name]["download"] += data.chunk.length;
    Files[Name]["buffer"] += data.chunk;
    if (Files[Name]["download"] == Files[Name]["fileSize"]) {
      fs.write(
        Files[Name]["Handler"],
        Files[Name]["buffer"],
        null,
        "Binary",
        function(err, Writen) {
          socket.emit("Done");
        }
      );
    } else if (Files[Name]["buffer"].length >= 10240000) {
      fs.write(
        Files[Name]["Handler"],
        Files[Name]["buffer"],
        null,
        "Binary",
        function(err, Writen) {
          Files[Name]["buffer"] = "";
          var place = Files[Name]["download"] / 1024000;
          var Percent =
            (Files[Name]["download"] / Files[Name]["fileSize"]) * 100;
          socket.emit("More_data", {
            place: place,
            downloaded: Percent
          });
        }
      );
    } else {
      var place = Files[Name]["download"] / 1024000;
      var Percent = (Files[Name]["download"] / Files[Name]["fileSize"]) * 100;
      socket.emit("More_data", {
        place: place,
        downloaded: Percent
      });
    }
  });
});

app.listen(5200, () => {
  console.log("server is running at 5200");
});
