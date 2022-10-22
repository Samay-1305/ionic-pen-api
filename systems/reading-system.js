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

module.exports = {
    read_book,
    get_book_info,
    get_next_chapter
}