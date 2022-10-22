const db = require('../models/IonicPenDB');

async function homepage(auth_key) {
  let response = {}
  if (auth_key) {
    try {
      response = await db.getUserProfileFromAuthKey(auth_key);
    } catch {

    }
  }
  return response
}

async function search(query) {
  let response = {
    "users": [],
    "books": []
  };
  try {
    const keywords = query.split(' ');
    for (let i = 0; i < keywords.length; i++) {
      console.log(1);
      result = await db.searchForKeyword(keywords[i]);
      console.log(result)
      response["users"] = response["users"].concat(result["users"]);
      response["books"] = response["books"].concat(result["books"]);
    }
  } catch {

  }
  return response
}

module.exports = {
  homepage,
  search
}