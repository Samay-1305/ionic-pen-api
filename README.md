# ionic-pen-api

REST API written in express.js with a MongoDB Database for the IonicPen application.

## API Routes:

[GET] `/api/` => Test API route.
<br/>
[POST] `/api/login/` => Send username and password to login user. Returns authentication key.
<br/>
[POST] `/api/signup/` => Send user details to createa new user. Returns authentication key.
<br/>
[GET] `/api/homepage/`=> Retrieve all the data needed for the application homepage.
<br/>
[GET] `/api/search/` => Search for keywords in Users and Books.
<br/>
[GET] `/api/books/:id/` => Retrieve a specific books information.
<br/>
[POST] `/api/books/new/` => Create a new book.
<br/>
[POST] `/api/books/new/chapter/` => Creates a new chapter for a book.
<br/>
[DELETE] `/api/books/:id/` => Delete a book.
<br/>
[POST] `/api/books/:id/publish/` => Publish a book. 
<br/>
[POST] `/api/books/:id/unpublish/` => Unpublish a book.
<br/>
[GET] `/api/books/read/:id/` => Read a book based on the last saved position.
<br/>
[GET] `/api/books/read/:id/next/` => Read the next chapter of a book.
<br/>
[GET] `/api/library/` => Get all the books in a users library.
<br/>
[POST] `/api/library/add/` => Add a new book to a users library.
<br/>
[DELETE] `/api/library/remove/:id/` => Remove a book from a users library.


## Database Models:

### EBook
book_id: UUID
<br/>
book_title: String
<br/>
chapters: [EBookChapter.chapter_id]
<br/>
author: UserProfile.username
<br/>
synopsis: String
<br/>
cover_image: Image
<br/>
published: Boolean
<br/>
reviews:[JSON]
<br/>
likes: [UserProfile.username]
<br/>

### EBookChapter
chapter_id: UUID
<br/>
chapter_name: String
<br/>
chapter_contents: String
<br/>
book_id: EBook.book_id
<br/>

### UserAccount
username: UserProfile.username
<br/>
password: String
<br/>
auth_key: UUID
<br/>

### UserProfile
username: String
<br/>
first_name: String
<br/>
last_name: String
<br/>
email_id: String
<br/>
profile_image: Image
<br/>
public_account: Boolean
<br/>
library: [EBook.book_id]
<br/>
works: [EBook.book_id]
<br/>

### EBookmark
book_id: EBook.book_id
<br/>
chapter_id: EBookChapter.chapter_id
<br/>
username: UserProfile.username
<br/>
char_position: Number
<br/>
