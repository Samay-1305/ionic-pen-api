const db = require("../models/IonicPenDB");

async function get_all_books(req, res) {
  let auth_key = req.headers["auth-key"];
  try {
    let books = db.getAllBooks();
    res.send({ books: books });
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function get_book_info(req, res) {
  let auth_key = req.headers["auth-key"];
  let book_id = req.params.book_id;
  try {
    let ebook = await db.getEBook(book_id);
    let profile = auth_key ? await db.getUserProfileFromAuthKey(auth_key) : {};
    res.send({
      book: ebook,
      is_author: profile.username === ebook.author,
    });
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function delete_book(req, res) {
  let auth_key = req.headers["auth-key"];
  let book_id = req.params.id;
  try {
    await db.deleteBookFromDatabase(auth_key, book_id);
    res.status(204).end();
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function read_book(req, res) {
  let chapter_id = req.params.chapter_id;
  try {
    let ebookChapter = await db.getEBookChapterByID(chapter_id);
    res.send(ebookChapter);
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function get_bookmark(req, res) {
  let auth_key = req.headers["auth-key"];
  let book_id = req.params.book_id;
  try {
    let bookmark = await db.getEBookmark(auth_key, book_id);
    res.send(bookmark);
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function set_bookmark(req, res) {
  let auth_key = req.headers["auth-key"];
  let book_id = req.body.book_id;
  let chapter_ind = req.body.chapter_ind;
  try {
    let bookmark = await db.setEBookmark(auth_key, book_id, chapter_ind);
    res.send(bookmark);
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function create_new_book(req, res) {
  let auth_key = req.headers["auth-key"];
  let book_title = req.body.book_title;
  let synopsis = req.body.synopsis;
  let cover_image = req.body.cover_image;
  try {
    let book_id = await db.createNewBook(
      auth_key,
      book_title,
      synopsis,
      cover_image
    );
    res.send({
      book_id: book_id,
    });
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function create_new_chapter(req, res) {
  let auth_key = req.headers["auth-key"];
  let chapter_title = req.body.chapter_title;
  let chapter_contents = req.body.chapter_contents;
  let book_id = req.body.book_id;
  try {
    await db.createNewChapter(
      auth_key,
      book_id,
      chapter_title,
      chapter_contents
    );
    res.status(201).end();
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function publish_book(req, res) {
  let auth_key = req.headers["auth-key"];
  let book_id = req.params.book_id;
  try {
    await db.publishExistingBook(auth_key, book_id);
    res.status(201).end();
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function unpublish_book(req, res) {
  let auth_key = req.headers["auth-key"];
  let book_id = req.params.book_id;
  try {
    await db.unpublishExistingBook(auth_key, book_id);
    res.status(201).end();
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function get_library_books(req, res) {
  let auth_key = req.headers["auth-key"];
  try {
    let profile = await db.getUserProfileFromAuthKey(auth_key);
    let library = [];
    let book_id = null;
    let book = null;
    for (let i = 0; i < profile.library.length; i++) {
      book_id = profile.library[i];
      book = await db.getEBook(book_id);
      library.push(book);
    }
    res.send({ library: library });
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function add_to_library(req, res) {
  let auth_key = req.headers["auth-key"];
  try {
    let book_id = req.body.book_id;
    await db.addBookToLibrary(auth_key, book_id);
    res.status(201).end();
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function remove_from_library(req, res) {
  let auth_key = req.headers["auth-key"];
  let book_id = req.params.id;
  try {
    await db.removeBookFromLibrary(auth_key, book_id);
    res.status(204).end();
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

module.exports = {
  get_book_info,
  delete_book,
  read_book,
  get_bookmark,
  set_bookmark,
  create_new_book,
  create_new_chapter,
  publish_book,
  unpublish_book,
  get_all_books,
  get_library_books,
  add_to_library,
  remove_from_library,
};
