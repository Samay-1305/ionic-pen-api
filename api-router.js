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

app.get('/api/homepage/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  home.homepage(auth_key).then((response) => {
    res.send(response);
  });
});

app.get('/api/search/', (req, res) => {
  let query = req.query['q'];
  home.search(query).then((response) => {
    res.send(response);
  });
});

app.get('/api/books/:id/', (req, res) => {
  let book_id = req.params.id;
  book.get_book_info(book_id).then((ebook) => {
    res.send(ebook);
  });
});

app.post('/api/books/new/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  let book_title = req.body['book_title'];
  let synopsis = req.body['synopsis'];
  let cover_image = req.body['cover_image'];
  book.create_new_book(auth_key, book_title, synopsis, cover_image).then((book_id) => {
    res.send({
      'book_id': book_id
    });
  });
});

app.post('/api/books/new/chapter/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  let chapter_title = req.body['chapter_title'];
  let chapter_contents = req.body['chapter_contents'];
  let book_id = req.body['book_id'];
  book.create_new_chapter(auth_key, chapter_title, chapter_contents, book_id).then(() => {
    res.status(201).end();
  });
});

app.delete('/api/books/:id/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  let book_id = req.params.id;
  book.delete_book(auth_key, book_id).then(() => {
    res.status(204).end();
  });
});

app.post('/api/books/:id/publish/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  let book_id = req.params.id;
  book.publish_book(auth_key, book_id).then(() => {
    res.status(201).end();
  });
});

app.post('/api/books/:id/unpublish/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  let book_id = req.params.id;
  book.unpublish_book(auth_key, book_id).then(() => {
    res.status(201).end();
  });
});

app.get('/api/books/read/:id/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  let book_id = req.params.id;
  book.read_book(auth_key, book_id).then((chapter) => {
    res.send(chapter);
  });
});

app.get('/api/books/read/:id/next/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  let book_id = req.params.id;
  book.get_next_chapter(auth_key, book_id).then((chapter) => {
    res.send(chapter);
  });
});

app.delete('/api/books/remove/:id/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  let book_id = req.params.id;
  book.remove_from_library(auth_key, book_id).then(() => {
    res.status(204).end();
  });
});

app.get('/api/library/', (req, res) => {
  let auth_key = req.headers['auth-key'];
  book.get_library_books(auth_key).then((library) => {
    res.send({'library': library});
  });
});

app.post('/api/library/add/', (req, res) => {
  let book_id = req.body.book_id;
  let auth_key = req.headers['auth-key'];
  book.add_to_library(auth_key, book_id).then(() => {
    res.status(201).end();
  });
});

app.delete('/api/library/remove/:id/', (req, res) => {
  let book_id = req.params.id;
  let auth_key = req.headers['auth-key'];
  book.remove_from_library(auth_key, book_id).then(() => {
    res.status(204).end();
  });
});

app.listen(port, () => {
  console.log(`Ionic-Pen-API app listening at http://${host}:${port}`);
});