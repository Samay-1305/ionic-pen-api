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

function getDatabaseConnection() {
  if (!dbConnection) {
    dbConnection = mongoose.createConnection(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
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
  if (!(bcrypt.compare(password, account.password, (err, res) => res))) {
    throw new Error("Invalid Password");
  }
  // if (password !== account.password) {
  //   throw new Error("Invalid Password");
  // }
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

async function searchForKeyword(query) {
  const conn = getDatabaseConnection();
  const UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  const EBookModel = conn.model("EBook", EBookSchema);
  const keyWord = query.toLowerCase();
  let response = {
    users: [],
    books: [],
  };
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
      if (profile.public_account) {
        response.users.push(profile);
      }
    }
  }
  for (let i = 0; i < ebooks.length; i++) {
    ebook = ebooks[i];
    if (
      ebook.book_title.toLowerCase().includes(keyWord) ||
      ebook.author.toLowerCase().includes(keyWord) ||
      ebook.synopsis.toLowerCase().includes(keyWord)
    ) {
      if (ebook.published) {
        response.books.push(ebook);
      }
    }
  }
  return response;
}

async function getEBook(book_id) {
  const conn = getDatabaseConnection();
  const EBookModel = conn.model("EBook", EBookSchema);
  let ebook = await EBookModel.findOne({ book_id: book_id });
  return ebook;
}

async function getEBookChapter(auth_key, book_id) {
  const conn = getDatabaseConnection();
  const EBookmarkModel = conn.model("EBookmark", EBookmarkSchema);
  const EBookChapterModel = conn.model("EBookChapter", EBookChapterSchema);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let bookmark = await EBookmarkModel.findOne({
    book_id: book_id,
    username: profile.username,
  });
  if (!bookmark) {
    let ebook = await getEBook(book_id);
    let chapter_id = null;
    if (ebook.chapters.length > 0) {
      chapter_id = ebook.chapters[0];
    }
    bookmark = new EBookmarkModel({
      book_id: book_id,
      chapter_id: chapter_id,
      username: profile.username,
      char_index: 0,
    });
    await bookmark.save();
  }
  let eBookChapter = await EBookChapterModel.findOne({
    chapter_id: bookmark["chapter_id"],
  });
  return eBookChapter;
}

async function getNextEBookChapter(auth_key, book_id) {
  const conn = getDatabaseConnection();
  const EBookmarkModel = conn.model("EBookmark", EBookmarkSchema);
  const EBookChapterModel = conn.model("EBookChapter", EBookChapterSchema);
  let ebook = await getEBook(book_id);
  let profile = await getUserProfileFromAuthKey(auth_key);
  let bookmark = await EBookmarkModel.findOne({
    book_id: book_id,
    username: profile["username"],
  });
  if (!bookmark) {
    return getEBookChapter(auth_key, book_id);
  }
  let chapter_index = 0;
  for (; chapter_index < ebook.chapters.length; chapter_index++) {
    if (ebook.chapters[chapter_index] === bookmark.chapter_id) {
      chapter_index++;
      break;
    }
  }
  if (chapter_index < ebook.chapters.length) {
    await EBookmarkModel.findOneAndUpdate(bookmark, {
      chapter_id: ebook.chapters[chapter_index],
      char_index: 0,
    });
    let eBookChapter = await EBookChapterModel.findOne({
      chapter_id: ebook.chapters[chapter_index],
    });
    return eBookChapter;
  }
  let eBookChapter = await EBookChapterModel.findOne({
    chapter_id: bookmark.chapter_id,
  });
  return eBookChapter;
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
  if (!profile) {
    throw new Error("User not found!");
  }
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
  let profile = getUserProfileFromAuthKey(auth_key);
  let book = getEBook(book_id);
  let del_ind = -1;
  if (book.author === profile.username) {
    del_ind = profile.works;
    if (del_ind > -1) {
      profile.works.splice(del_ind, 1);
    }
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
  let profile = getUserProfileFromAuthKey(auth_key);
  let book = getEBook(book_id);
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
  let profile = getUserProfileFromAuthKey(auth_key);
  let book = getEBook(book_id);
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
    book.chapters.push(chapter.chapter_id);
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
  getAuthKeyFromCredentials,
  getUserProfileFromAuthKey,
  createNewUserAccountAndProfile,
  searchForKeyword,
  getEBook,
  getEBookChapter,
  getNextEBookChapter,
  addBookToLibrary,
  removeBookFromLibrary,
  deleteBookFromDatabase,
  getAllBooks,
  publishExistingBook,
  unpublishExistingBook,
  createNewBook,
  createNewChapter,
};
