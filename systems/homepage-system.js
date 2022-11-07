const db = require("../models/IonicPenDB");

function getUnique(arr, key) {
  let set = new Set();
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (!set.has(arr[i][key])) {
      result.push(arr[i]);
      set.add(arr[i][key]);
    }
  }
  return result;
}

async function homepage(req, res) {
  let auth_key = req.headers["auth-key"];
  if (!auth_key) {
    res.send({ error: "User is not logged in" });
  }
  try {
    let response = {
      profile: await db.getUserProfileFromAuthKey(auth_key),
      books: await db.getAllBooks(),
      library: [],
    };
    if (response.profile.library) {
      for (let book_id in response.profile.library) {
        response.library.push(await db.getEBook(book_id));
      }
    }
    res.send(response);
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function search(req, res) {
  let query = req.query["q"];
  try {
    let response = {
      users: [],
      books: [],
    };
    const keywords = query.split(" ");
    for (let i = 0; i < keywords.length; i++) {
      result = await db.searchForKeyword(keywords[i]);
      response["users"] = response["users"].concat(result["users"]);
      response["books"] = response["books"].concat(result["books"]);
    }
    response["users"] = getUnique(response["users"]);
    response["books"] = getUnique(response["books"]);
    res.send(response);
  } catch (err) {
    res.send({
      error: "Unknown Exception",
    });
  }
}

module.exports = {
  homepage,
  search,
};
