const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {
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

test("createNewUserAccountAndProfile", async () => {
  await expect(createNewUserAccountAndProfile(
    "tom123",
    "tom",
    "davis",
    "tom_d@gmail.com",
    await bcrypt.hash("123", 5)
  )).rejects.toThrow('Username already exists!');
  /*
  .toBe(new Error("88a7db70-7222-11ed-bfcc-9977406adf0d"));
  */
});
test("getAuthKeyFromCredentials", async () => {
  await expect(getAuthKeyFromCredentials(
    "tom123",
    "123"
  )).resolves.toBe("88a7db70-7222-11ed-bfcc-9977406adf0d");
});

test("getUserProfileFromAuthKey", async () => {
  await expect(getUserProfileFromAuthKey(
    "88a7db70-7222-11ed-bfcc-9977406adf0d"
  )).resolves.toHaveProperty("username", "tom123");
});

test("getUserProfileFromUsername", async () => {
  await expect(getUserProfileFromUsername("tom123"))
  .resolves.toHaveProperty("username", "tom123");
});
/*
test("searchForKeyword", () => {
    await expect(searchForKeyword(
      "88a7db70-7222-11ed-bfcc-9977406adf0d", ""
    )).toBe("");
});
*/
test("getEBook", async () => {
  await expect(getEBook("382c14f0-6f60-11ed-9617-ff046d1a7ed9"))
  .resolves.toHaveProperty("book_title", "Hidden Treasure");
});
test("getEBookmark", async () => {
  await expect(getEBookmark(
    "88a7db70-7222-11ed-bfcc-9977406adf0d", 
    "382c14f0-6f60-11ed-9617-ff046d1a7ed9"
  )).resolves.toHaveProperty("chapter_ind", 0);
});
/*
test("", () => {
    expect(setEBookmark("", "")).toBe("");
});
*/

test("getEBookChapterByID", async () => {
    await expect(getEBookChapterByID(
      "44e104a0-7224-11ed-9755-4f043c7e6ed8"
    )).resolves.toHaveProperty("chapter_name", "Chapter 3: The Treasure is Found");
});
/*
test("", () => {
    expect(addBookToLibrary("", "")).toBe("");
});
test("", () => {
    expect(removeBookFromLibrary("", "")).toBe("");
});
test("", () => {
    expect(deleteBookFromDatabase("", "")).toBe("");
});
test("", () => {
    expect(getAllBooks("", "")).toBe("");
});
test("", () => {
    expect(publishExistingBook("", "")).toBe("");
});
test("", () => {
    expect(unpublishExistingBook("", "")).toBe("");
});
test("", () => {
    expect(createNewBook("", "")).toBe("");
});
test("", () => {
    expect(createNewChapter("", "")).toBe("");
});
*/
afterAll((done) => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.disconnect();
  done();
})