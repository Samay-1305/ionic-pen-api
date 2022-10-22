const { response } = require('express');
const db = require('../models/IonicPenDB');

/* For authentication related functions */

async function login(username, password) {
    let auth_key = null;
    try {
        auth_key = await db.getAuthKeyFromCredentials(username, password);
    } catch {

    }
    return auth_key;
}

async function sign_up(username, first_name, last_name, email_id, password) {
    let auth_key = null;
    try {
        auth_key = await db.createNewUserAccountAndProfile(username, first_name, last_name, email_id, password);
    } catch {

    }
    return auth_key;
}

module.exports = {
    login,
    sign_up
}