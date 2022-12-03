const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserAccountSchema = require("./UserAccountSchema");
const UserProfileSchema = require("./UserProfileSchema");
const EBookSchema = require("./EBookSchema");
const EBookChapterSchema = require("./EBookChapterSchema");
const EBookmarkSchema = require("./EBookmarkSchema");

const {
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
} = require("./IonicPenDB");

let mongoServer;
let conn;
let UserAccountModel;
let UserProfileModel;
let EBookModel;
let EBookChapterModel;
let EBookmarkModel;
let validAuthKey;
let validBookId;
let validChapterId;
let validBookIdToBeDeleted;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  conn = await mongoose.createConnection(uri, mongooseOpts);

  UserAccountModel = conn.model("UserAccount", UserAccountSchema);
  UserProfileModel = conn.model("UserProfile", UserProfileSchema);
  EBookModel = conn.model("EBook", EBookSchema);
  EBookChapterModel = conn.model("EBookChapter", EBookChapterSchema);
  EBookmarkModel = conn.model("EBookmark", EBookmarkSchema);

  setDatabaseConnection(conn);

  let userAccount1 = new UserAccountModel({
    username: "ionic",
    password: await bcrypt.hash("ionic_user", 5),
  });
  await userAccount1.save();

  let userProfile1 = new UserProfileModel({
    username: "ionic",
    first_name: "Ionic",
    last_name: "Pen",
    email_id: "admin@ionicpen.ml",
  });
  await userProfile1.save();

  let book1 = new EBookModel({
    book_title: "Hidden Treasure",
    author: "ionic",
  });
  await book1.save();

  let book2 = new EBookModel({
    book_title: "Forbidden Voices",
    author: "ionic",
  });
  await book2.save();

  let chapter1 = new EBookChapterModel({
    chapter_name: "Chapter 1: The Beginning",
    chapter_contents:
      "In the first chapter of Hidden Treasure, we meet the main character, a young adventurer named Jack. He lives in a small village and has always dreamed of finding hidden treasure. When a mysterious old map falls into his hands, he sets off on an exciting journey to find the treasure and fulfill his dream.",
    book_id: book1.book_id,
  });
  await chapter1.save();

  userProfile1.works.push(book1.book_id);
  userProfile1.works.push(book2.book_id);
  await userProfile1.save();

  book1.chapters.push({
    chapter_id: chapter1.chapter_id,
    chapter_name: "Chapter 1: The Beginning",
  });
  await book1.save();

  validAuthKey = userAccount1.auth_key;
  validBookId = book1.book_id;
  validBookIdToBeDeleted = book2.book_id;
  validChapterId = chapter1.chapter_id;
});

test("Create User -- success", async () => {
  let result = await createNewUserAccountAndProfile(
    "tom",
    "tom",
    "davis",
    "tom_d@gmail.com",
    "123"
  );
  expect(result).toBeDefined();
});

test("Create User -- error", async () => {
  await expect(async () => {
    await createNewUserAccountAndProfile(
      "ionic",
      "tom",
      "davis",
      "tom_d@gmail.com",
      "123"
    );
  }).rejects.toThrow("Username already exists!");
});

test("getAuthKeyFromCredentials -- success", async () => {
  let result = await getAuthKeyFromCredentials("ionic", "ionic_user");
  expect(result).toBeDefined();
});

test("getAuthKeyFromCredentials -- fail (1)", async () => {
  await expect(getAuthKeyFromCredentials(null, "ionic_user")).rejects.toThrow(
    "Username cannot be empty"
  );
});

test("getAuthKeyFromCredentials -- fail (2))", async () => {
  await expect(getAuthKeyFromCredentials("ionic", null)).rejects.toThrow(
    "Password cannot be empty"
  );
});

test("getAuthKeyFromCredentials -- fail (3))", async () => {
  await expect(
    getAuthKeyFromCredentials("invalid_user", "password")
  ).rejects.toThrow("Invalid Username");
});

test("getAuthKeyFromCredentials -- fail (4))", async () => {
  await expect(
    getAuthKeyFromCredentials("ionic", "wrong_password")
  ).rejects.toThrow("Invalid Password");
});

test("getUserProfileFromAuthKey -- success", async () => {
  await expect(getUserProfileFromAuthKey(validAuthKey)).resolves.toHaveProperty(
    "username",
    "ionic"
  );
});

test("getUserProfileFromAuthKey -- error (1)", async () => {
  await expect(getUserProfileFromAuthKey()).rejects.toThrow("Auth key needed");
});

test("getUserProfileFromAuthKey -- error (2)", async () => {
  await expect(
    getUserProfileFromAuthKey(validAuthKey + "invalid")
  ).rejects.toThrow("Invalid User");
});

test("getUserProfileFromUsername -- success", async () => {
  await expect(getUserProfileFromUsername("ionic")).resolves.toHaveProperty(
    "first_name",
    "Ionic"
  );
});

test("getUserProfileFromUsername -- error", async () => {
  await expect(getUserProfileFromUsername()).rejects.toThrow("Username needed");
});

test("searchForKeyword -- success (1)", async () => {
  await expect(searchForKeyword("Hidden")).toMatchObject({});
});

test("searchForKeyword -- success (2)", async () => {
  await expect(searchForKeyword("ionic")).toMatchObject({});
});

test("getEBook -- success", async () => {
  await expect(getEBook(validBookId)).resolves.toHaveProperty(
    "book_title",
    "Hidden Treasure"
  );
});

test("getEBookmark -- success", async () => {
  await expect(getEBookmark(validAuthKey, validBookId)).resolves.toHaveProperty(
    "chapter_ind",
    0
  );
});

test("setEBookmark -- successs", async () => {
  expect(await setEBookmark(validAuthKey, validBookId, 0)).toBeUndefined();
});

test("getEBookChapterByID -- success", async () => {
  await expect(getEBookChapterByID(validChapterId)).resolves.toHaveProperty(
    "chapter_name",
    "Chapter 1: The Beginning"
  );
});

test("addBookToLibrary -- success", async () => {
  expect(await addBookToLibrary(validAuthKey, validBookId)).toBeUndefined();
});

test("removeBookFromLibrary -- success", async () => {
  expect(
    await removeBookFromLibrary(validAuthKey, validBookId)
  ).toBeUndefined();
});

test("removeBookFromLibrary -- error", async () => {
  expect(
    removeBookFromLibrary(validAuthKey + "invalid", validBookId)
  ).rejects.toThrow("Invalid User");
});

test("deleteBookFromDatabase -- success", async () => {
  expect(await deleteBookFromDatabase(validAuthKey, validBookIdToBeDeleted))
    .toBeUndefined;
});

test("getAllBooks -- success", async () => {
  let result = await getAllBooks();
  expect(result).toBeDefined();
  expect(result.length).toBeGreaterThan(0);
});

test("unpublishExistingBook -- success", async () => {
  expect(await unpublishExistingBook(validAuthKey, validBookId)).toBeUndefined();
});

test("publishExistingBook -- success", async () => {
  expect(await publishExistingBook(validAuthKey, validBookId)).toBeUndefined();
});


test("createNewBook -- success", async () => {
  let result = await createNewBook(validAuthKey, "New book", "A new book", "");
  expect(result).toBeDefined();
});

test("createNewChapter -- success", async () => {
  let result = await createNewChapter(validAuthKey, validBookId, "New Chapter", "Something new");
    expect(result).toBeUndefined();
});

afterAll(async () => {
  await conn.dropDatabase();
  await conn.close();
  await mongoServer.stop();
});
