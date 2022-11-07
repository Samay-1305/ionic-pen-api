const express = require('express');
const cors = require('cors');

const auth = require('./systems/auth-system');
const home = require('./systems/homepage-system');
const book = require('./systems/reading-system');

const config = require('./config');

const { api: { host, port, name }} = config;

const app = express();
app.use(cors());
app.use(express.json());


app.get('/api/', (req, res) => {
  res.send({'response': 'Welcome to Ionic Pen!'});
});

app.post('/api/login/', auth.login);

app.post('/api/signup/', auth.sign_up);

app.get('/api/homepage/', home.homepage);

app.get('/api/search/', home.search);

app.get('/api/books/:id/', book.get_book_info);

app.post('/api/books/new/', book.create_new_book);

app.post('/api/books/new/chapter/', book.create_new_chapter);

app.delete('/api/books/:id/', book.delete_book);

app.post('/api/books/:id/publish/', book.publish_book);

app.post('/api/books/:id/unpublish/', book.unpublish_book);

app.get('/api/books/read/:id/', book.read_book);

app.get('/api/books/read/:id/next/', book.get_next_chapter);

app.delete('/api/books/remove/:id/', book.remove_from_library);

app.get('/api/library/', book.get_library_books);

app.post('/api/library/add/', book.add_to_library);

app.delete('/api/library/remove/:id/', book.remove_from_library);

app.listen(port, () => {
  console.log(`Ionic-Pen-API app listening at http://${host}:${port}`);
});