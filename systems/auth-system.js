const db = require("../models/IonicPenDB");

async function login(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  try {
    let auth_key = await db.getAuthKeyFromCredentials(username, password);
    res.send({
      "auth-key": auth_key,
    });
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

async function sign_up(req, res) {
  let username = req.body.username;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email_id = req.body.email_id;
  let password = req.body.password;
  try {
    let auth_key = await db.createNewUserAccountAndProfile(
      username,
      first_name,
      last_name,
      email_id,
      password
    );
    res.send({
      "auth-key": auth_key,
    });
  } catch (err) {
    res.send({
      error: err.message,
    });
  }
}

module.exports = {
  login,
  sign_up,
};
