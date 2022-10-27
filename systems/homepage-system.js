const db = require('../models/IonicPenDB');

function getUnique(arr, key) {
  let set = new Set();
  let result = [];
  for (let i=0; i<arr.length; i++) {
    if (!set.has(arr[i][key])) {
      result.push(arr[i]);
      set.add(arr[i][key]);
    }
  }
  return result;
}

async function homepage(auth_key) {
  let response = {};
  if (auth_key) {
    try {
      response['profile'] = await db.getUserProfileFromAuthKey(auth_key);
      response['books'] = await db.getAllBooks();
      response['library'] = [];
      for (let book_id in response['profile']['library']) {
        response['library'].push(await db.getEBook(book_id));
      }
    } catch(err) {
      console.log(err);
    }
  }
  return response;
}

async function search(query) {
  let response = {
    'users': [],
    'books': []
  };
  try {
    const keywords = query.split(' ');
    for (let i = 0; i < keywords.length; i++) {
      result = await db.searchForKeyword(keywords[i]);
      response['users'] = response['users'].concat(result['users']);
      response['books'] = response['books'].concat(result['books']);
    }
  } catch(err) {
    console.log(err);
  }
  response['users'] = getUnique(response['users']);
  response['books'] = getUnique(response['books']);
  return response;
}

module.exports = {
  homepage,
  search
}