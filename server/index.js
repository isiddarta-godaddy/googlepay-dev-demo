const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

// global configs
global.configs = require("./lib/configs");

// redirect home to Connect demo
app.get("/", (_req, res) => {
  res.redirect("/link");
});

app.use("/collect", require("./routes/collect"));

const port = 1347;
app.listen(port, () => {
  console.log(`Google Pay Node JS app listening at ${port}`);
});