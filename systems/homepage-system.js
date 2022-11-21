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

async function get_homepage(req, res) {
  let auth_key = req.headers["auth-key"];
  try {
    let response = {
      profile: auth_key ? await db.getUserProfileFromAuthKey(auth_key) : {},
      books: await db.getAllBooks(),
      library: [],
    };
    if (response.profile.library) {
      let book_id = null;
      let book_data = null;
      for (let ind in response.profile.library) {
        book_id = response.profile.library[ind];
        book_data = await db.getEBook(book_id);
        response.library.push(book_data);
      }
    }
    res.send(response);
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function perform_search(req, res) {
  let auth_key = req.headers["auth-key"];
  let query = req.query.q;
  try {
    let response = {
      users: [],
      books: [],
    };
    const keywords = query.split(" ");
    for (let i = 0; i < keywords.length; i++) {
      result = await db.searchForKeyword(keywords[i], auth_key);
      response["users"] = response["users"].concat(result["users"]);
      response["books"] = response["books"].concat(result["books"]);
    }
    response["users"] = getUnique(response["users"], "username");
    response["books"] = getUnique(response["books"], "book_id");
    res.send(response);
  } catch (err) {
    res.send({
      error: "Unknown Exception",
    });
  }
}

async function get_user_profile(req, res) {
  let auth_key = req.headers["auth-key"];
  let username = req.query.username;
  try {
    let response = {};
    if (auth_key && !username) {
      response = await db.getUserProfileFromAuthKey(auth_key);
    }
    if (username) {
      response = await db.getUserProfileFromUsername(username)
    }
    res.send(response);
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

module.exports = {
  get_homepage,
  perform_search,
  get_user_profile
};
