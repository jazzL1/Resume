const express = require("express");
const app = express();
const path = require("path");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("public", path.join(__dirname, "public"));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("resume");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
