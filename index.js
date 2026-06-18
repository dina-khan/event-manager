/** This file defines entry point routes */


const express = require("express");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); 
app.use(express.static(__dirname + "/public")); 

const sqlite3 = require("sqlite3").verbose();
global.db = new sqlite3.Database("./database.db", function (err) {
    if (err) {
        console.error(err);
        process.exit(1); 
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); 
    }
});

// Route for get requests to the home page.
// Renders the home page template
app.get("/", (req, res) => {
    res.render("home");
});

const organiserRoutes = require("./routes/organiser");
const attendeeRoutes = require("./routes/attendee");
app.use("/organiser", organiserRoutes);
app.use("/attendee", attendeeRoutes);

// Listening for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
