const express = require('express');
const cors = require('cors');

const host = "127.0.0.1";
const port = 3200;


const app = express();
app.use(cors());
app.use(express.json());


app.get("/api/", (req, res) => {
    res.send({"response": "Welcome to Ionic Pen!"});
})

app.listen(port, () => {
    console.log(`Ionic-Pen-API app listening at http://${host}:${port}`);
});