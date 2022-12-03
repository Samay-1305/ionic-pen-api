const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserAccountSchema = require("./UserAccountSchema");
const UserProfileSchema = require("./UserProfileSchema");
const EBookSchema = require("./EBookSchema");
const EBookChapterSchema = require("./EBookChapterSchema");
const EBookmarkSchema = require("./EBookmarkSchema");

const config = require("../config");

const {
  database: { host, name, username, password },
} = config;

const DATABASE_NAME = name;
const DATABASE_URL = `mongodb+srv://${username}:${password}@${host}/${DATABASE_NAME}?retryWrites=true&w=majority`;

let dbConnection = null;

function setDatabaseConnection(connection) {
  dbConnection = connection;
}

function getDatabaseConnection() {
  return dbConnection;
}

async function getAuthKeyFromCredentials(username, password) {
  const conn = getDatabaseConnection();
  const UserAccountModel = conn.model("UserAccount", UserAccountSchema);
  if (!username) {
    throw new Error("Username cannot be empty");
  }
  if (!password) {
    throw new Error("Password cannot be empty");
  }
  let account = await UserAccountModel.findOne({
    username: username,
  });
  if (!account) {
    throw new Error("Invalid Username");
  }
  let password_is_valid = await bcrypt.compare(password, account.password);
  if (!password_is_valid) {
    throw new Error("Invalid Password");
  }
  return account.auth_key;
}

async function createNewUserAccountAndProfile(
  username,
  first_name,
  last_name,
  email_id,
  password
) {
  const conn = getDatabaseConnection();
  const UserAccountModel = conn.model("UserAccount", UserAccountSchema);
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  let account = new UserAccountModel({
    username: username,
    password: password,
  });
  let profile = new UserProfileModel({
    username: username,
    first_name: first_name,
    last_name: last_name,
    email_id: email_id,
  });
  try {
    await profile.save();
    await account.save();
  } catch (err) {
    const error_message_field = err.message.split("{")[1].split(" ")[1];
    const error_message = `${
      error_message_field === "username:" ? "Username" : "Email ID"
    } already exists!`;
    throw new Error(error_message);
  }
  return account.auth_key;
}

async function getUserProfileFromAuthKey(auth_key) {
  const conn = getDatabaseConnection();
  const UserAccountModel = conn.model("UserAccount", UserAccountSchema);
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  if (!auth_key) {
    throw new Error("Auth key needed");
  }
  let account = await UserAccountModel.findOne({
    auth_key: auth_key,
  });
  if (!account) {
    throw new Error("Invalid User");
  }
  let profile = await UserProfileModel.findOne({
    username: account.username,
  });
  return profile;
}

async function getUserProfileFromUsername(username) {
  const conn = getDatabaseConnection();
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  if (!username) {
    throw new Error("Username needed");
  }
  let profile = await UserProfileModel.findOne({
    username: username,
  });
  return profile;
}

async function searchForKeyword(query, auth_key) {
  const conn = getDatabaseConnection();
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  const EBookModel = conn.model("EBook", EBookSchema);
  const keyWord = query.toLowerCase();
  let response = {
    users: [],
    books: [],
  };
  let user_profile = auth_key
    ? await getUserProfileFromAuthKey(auth_key)
    : null;
  let profiles = await UserProfileModel.find({});
  let profile = null;
  let ebooks = await EBookModel.find({});
  let ebook = null;
  for (let i = 0; i < profiles.length; i++) {
    profile = profiles[i];
    if (
      profile.username.includes(keyWord) ||
      profile.first_name.toLowerCase().includes(keyWord) ||
      profile.last_name.toLowerCase().includes(keyWord)
    ) {
      response.users.push(profile);
    }
  }
  for (let i = 0; i < ebooks.length; i++) {
    ebook = ebooks[i];
    if (
      ebook.book_title.toLowerCase().includes(keyWord) ||
      ebook.author.toLowerCase().includes(keyWord) ||
      (ebook.synopsis && ebook.synopsis.toLowerCase().includes(keyWord))
    ) {
      response.books.push(ebook);
    }
  }
  return response;
}

async function getEBook(book_id) {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  const EBookChapterModel = conn.model("EBookChapter", EBookChapterSchema);
  let ebook = await EBookModel.findOne({ book_id: book_id });
  let chapters = [];
  let chapter_info = {};
  for (let i = 0; i < ebook.chapters.length; i++) {
    chapter_info = await EBookChapterModel.findOne({
      chapter_id: ebook.chapters[i].chapter_id,
    });
    chapters.push({
      chapter_id: chapter_info.chapter_id,
      chapter_name: chapter_info.chapter_name,
    });
  }
  ebook.chapters = chapters;
  return ebook;
}

async function getEBookmark(auth_key, book_id) {
  const conn = getDatabaseConnection();
  const EBookmarkModel = conn.model("EBookmark", EBookmarkSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let bookmark = await EBookmarkModel.findOne({
    book_id: book_id,
    username: profile.username,
  });
  if (!bookmark) {
    bookmark = new EBookmarkModel({
      book_id: book_id,
      chapter_ind: 0,
      username: profile.username,
      char_index: 0,
    });
    await bookmark.save();
  }
  return bookmark;
}

async function setEBookmark(auth_key, book_id, chapter_ind) {
  const conn = getDatabaseConnection();
  const EBookmarkModel = conn.model("EBookmark", EBookmarkSchema);
  let ebook = await getEBook(book_id);
  let bookmark = await getEBookmark(auth_key, book_id);
  if (chapter_ind < ebook.chapters.length) {
    await EBookmarkModel.findOneAndUpdate(bookmark, {
      chapter_ind: chapter_ind,
    });
  }
}

async function getEBookChapterByID(chapter_id) {
  const conn = getDatabaseConnection();
  const EBookChapterModel = conn.model("EBookChapter", EBookChapterSchema);
  return await EBookChapterModel.findOne({ chapter_id: chapter_id });
}

async function addBookToLibrary(auth_key, book_id) {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let ebook = await EBookModel.findOne({ book_id: book_id });
  if (ebook && !profile.library.includes(book_id)) {
    profile = await UserProfileModel.findOneAndUpdate(profile, {
      library: [...profile.library, book_id],
    });
  }
}

async function removeBookFromLibrary(auth_key, book_id) {
  const conn = getDatabaseConnection();
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let index = profile.library.indexOf(book_id);
  if (index > -1) {
    profile["library"].splice(index, 1);
    profile = await UserProfileModel.findOneAndUpdate(
      {
        username: profile["username"],
      },
      {
        library: profile["library"],
      }
    );
  }
}

async function deleteBookFromDatabase(auth_key, book_id) {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let book = await getEBook(book_id);
  let del_ind = -1;
  if (book.author === profile.username) {
    del_ind = profile.works.indexOf(book_id);
    profile.works.splice(del_ind, 1);
    await UserProfileModel.findOneAndUpdate(
      {
        username: profile.username,
      },
      {
        works: profile.works,
      }
    );
    await EBookModel.deleteOne({ book_id: book_id });
  }
}

async function getAllBooks() {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  let books = await EBookModel.find({});
  return books;
}

async function publishExistingBook(auth_key, book_id) {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let book = await getEBook(book_id);
  if (book.author === profile.username) {
    await EBookModel.findOneAndUpdate(
      {
        book_id: book_id,
      },
      {
        published: true,
      }
    );
  }
}

async function unpublishExistingBook(auth_key, book_id) {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let book = await getEBook(book_id);
  if (book.author === profile.username) {
    await EBookModel.findOneAndUpdate(
      {
        book_id: book_id,
      },
      {
        published: false,
      }
    );
  }
}

async function createNewBook(auth_key, book_title, synopsis, cover_image) {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  ebook_data = {
    author: profile.username,
    book_title: book_title,
  };
  if (synopsis) {
    ebook_data["synopsis"] = synopsis;
  }
  if (cover_image) {
    ebook_data["cover_image"] = cover_image;
  }
  let book = new EBookModel(ebook_data);
  await book.save();
  let works = profile.works;
  works.push(book.book_id);
  await UserProfileModel.findOneAndUpdate(
    {
      username: profile.username,
    },
    {
      works: works,
    }
  );
  return book.book_id;
}

async function createNewChapter(auth_key, book_id, title, contents) {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  const EBookChapterModel = conn.model("EBookChapter", EBookChapterSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let chapter_data = {
    chapter_name: title,
    chapter_contents: contents,
    book_id: book_id,
  };
  let book = await getEBook(book_id);
  if (book.author === profile.username) {
    let chapter = new EBookChapterModel(chapter_data);
    await chapter.save();
    book.chapters.push({
      chapter_id: chapter.chapter_id,
      chapter_name: title,
    });
    await EBookModel.findOneAndUpdate(
      {
        book_id: book_id,
      },
      {
        chapters: book["chapters"],
      }
    );
  }
}

module.exports = {
  getDatabaseConnection,
  setDatabaseConnection,
  getAuthKeyFromCredentials,
  getUserProfileFromAuthKey,
  getUserProfileFromUsername,
  createNewUserAccountAndProfile,
  searchForKeyword,
  getEBook,
  getEBookmark,
  setEBookmark,
  getEBookChapterByID,
  addBookToLibrary,
  removeBookFromLibrary,
  deleteBookFromDatabase,
  getAllBooks,
  publishExistingBook,
  unpublishExistingBook,
  createNewBook,
  createNewChapter,
};
