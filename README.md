# ionic-pen-api

REST API written in express.js with a MongoDB Database for the IonicPen application.

## API Routes:

[GET] `/api/` => Test API route

[POST] `/api/login/` => Send username and password to login user. Returns authentication key.

[POST] `/api/signup/` => Send user details to createa new user. Returns authentication key.

[GET] `/api/homepage/`=> Retrieve all the data needed for the application homepage.

[GET] `/api/search/` => Search for keywords in Users and Books.

[GET] `/api/books/:id/` => Retrieve a specific books information.

[GET] `/api/books/read/:id/` => Read a book based on the last saved position.

[GET] `/api/books/read/:id/next/` => Read the next chapter of a book.

[GET] `/api/library/` => Get all the books in a users library.

[POST] `/api/library/add/` => Add a new book to a users library.

[DELETE] `api/library/remove/:id/` => Remove a book from a users library.


## Database Models:

##### EBook
book_id: UUID
chapters: [EBookChapter.chapter_id]
author: UserProfile.username
synopsis: String
cover_image: Image
reviews:[JSON]
likes: [UserProfile.username]

##### EBookChapter
chapter_id: UUID
chapter_name: String
chapter_contents: String
book_id: EBook.book_id

##### UserAccount
username: UserProfile.username
password: String
auth_key: UUID

##### UserProfile
username: String
first_name: String
last_name: String
email_id: String
profile_image: Image
public_account: Bool
library: [EBook.book_id]
published_works: [EBook.book_id]
unpublished_works: [EBook.book_id]

##### EBookmark
book_id: EBook.book_id
chapter_id: EBookChapter.chapter_id
username: UserProfile.username
char_position: Number