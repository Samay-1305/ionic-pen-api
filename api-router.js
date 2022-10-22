const express = require('express');
const cors = require('cors');

const auth = require('./systems/auth-system');
const home = require('./systems/homepage-system');
const book = require('./systems/reading-system');

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

app.get("/api/homepage/", (req, res) => {
    let auth_key = req.headers['auth-key'];
    home.homepage(auth_key).then((response) => {
        res.send(response)
    });
});

app.get("/api/search/", (req, res) => {
    let query = req.query['q'];
    home.search(query).then((response) => {
        res.send(response);
    });
});

app.get("/api/books/:id/", (req, res) => {
    let book_id = req.params.id;
    book.get_book_info(book_id).then((ebook) => {
        res.send(ebook);
    });
});

app.get("/api/books/read/:id/", (req, res) => {
    let auth_key = req.headers['auth-key'];
    let book_id = req.params.id;
    book.read_book(auth_key, book_id).then((chapter) => {
        res.send(chapter);
    })
});

app.listen(port, () => {
    console.log(`Ionic-Pen-API app listening at http://${host}:${port}`);
});