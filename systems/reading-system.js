const db = require('../models/IonicPenDB');

async function get_book_info(book_id) {
    let ebook = await db.getEBook(book_id);
    return ebook;
}

async function read_book(auth_key, book_id) {
    let ebookChapter = await db.getEBookChapter(auth_key, book_id);
    return ebookChapter;
}

async function get_next_chapter(auth_key, book_id) {
    let ebookChapter = await db.getNextEBookChapter(auth_key, book_id);
    return ebookChapter;
}

async function get_library_books(auth_key) {
    let profile = await db.getUserProfileFromAuthKey(auth_key);
    let library = [];
    let book_id = null;
    let book = null;
    for (let i=0; i<profile["library"].length; i++) {
        book_id = profile["library"][i];
        book = await db.getEBook(book_id);
        library.push(book);
    }
    return library;
}

async function add_to_library(auth_key, book_id) {
    await db.addBookToLibrary(auth_key, book_id);
}

async function remove_from_library(auth_key, book_id) {
    await db.removeBookFromLibrary(auth_key, book_id);
}

module.exports = {
    read_book,
    get_book_info,
    get_next_chapter,
    get_library_books,
    add_to_library,
    remove_from_library
}