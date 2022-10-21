const express = require('express');
const cors = require('cors');

const auth = require('./systems/auth-system');
const home = require('./systems/homepage-system');
const { response } = require('express');

const host = "127.0.0.1";
const port = 3200;

const app = express();
app.use(cors());
app.use(express.json());


app.get("/api/", (req, res) => {
    res.send({"response": "Welcome to Ionic Pen!"});
});

app.post("/api/login/", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    auth.login(username, password).then((auth_key) => {
        res.send({
            "auth-key": auth_key
        })
    });
});

app.post("/api/signup/", (req, res) => {
    let username = req.body.username;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email_id = req.body.email_id;
    let password = req.body.password;
    auth.sign_up(username, first_name, last_name, email_id, password).then((auth_key) => {
        res.send({
            "auth-key": auth_key
        })
    });
});

app.post("/api/homepage/", (req, res) => {
    let auth_key = req.body['auth-key'];
    home.homepage(auth_key).then((response) => {
        res.send(response)
    });
});

app.listen(port, () => {
    console.log(`Ionic-Pen-API app listening at http://${host}:${port}`);
});