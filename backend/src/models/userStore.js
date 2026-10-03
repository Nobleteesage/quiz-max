const db = require('./db');

function createUser(username, passwordHash) {
  const result = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(username, passwordHash);
  return { id: result.lastInsertRowid, username };
}

function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

module.exports = { createUser, findUserByUsername };
