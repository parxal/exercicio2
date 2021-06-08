/*  HTTPS */
const https = require("https");
const fs = require("fs"),
dotenv = require('dotenv');

// Get the configuration values
dotenv.config();
const port = process.env.PORT;
var server = process.env.SERVER;

/*  CERTIFICATE */
var keyname = "./certs/" + server + "-key.pem";
var certname = "./certs/" + server + ".pem";
    
const certs = {
    key: fs.readFileSync(keyname),
    cert: fs.readFileSync(certname)
};

module.exports = {
    port,
    https,
    certs 
}