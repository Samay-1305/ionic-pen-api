const express = require("express");
const cors = require("cors");

const auth = require("./systems/auth-system");
const home = require("./systems/homepage-system");
const library = require("./systems/library-system");

const config = require("./config");

const process = require("process");

const {
  api: { host, port },
} = config;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/", (req, res) => {
  res.send({ response: "Welcome to Ionic Pen!" });
});

app.post("/api/login/", auth.login);

app.post("/api/signup/", auth.sign_up);

app.get("/api/homepage/", home.get_homepage);

app.get("/api/search/", home.perform_search);

app.get("/api/profile/", home.get_user_profile);

app.get("/api/books/", library.get_all_books);

app.get("/api/books/:book_id/", library.get_book_info);

app.delete("/api/books/:book_id/", library.delete_book);

app.get("/api/books/read/:chapter_id/", library.read_book);

app.get("/api/bookmark/get/:book_id/", library.get_bookmark);

app.put("/api/bookmark/set/", library.set_bookmark);

app.post("/api/books/new/", library.create_new_book);

app.post("/api/books/edit", library.edit_book_info);

app.post("/api/books/new/chapter/", library.create_new_chapter);

app.patch("/api/books/publish/:book_id/", library.publish_book);

app.patch("/api/books/unpublish/:book_id/", library.unpublish_book);

app.get("/api/library/", library.get_library_books);

app.post("/api/library/add/", library.add_to_library);

app.patch("/api/library/remove/:id/", library.remove_from_library);

app.listen(process.env.PORT || port, () => {
  console.log(
    `Ionic-Pen-API app listening at http://${host}:${process.env.PORT || port}`
  );
});
