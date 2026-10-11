const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbFile = process.env.NODE_ENV === 'test' ? 'quizmax.test.db' : 'quizmax.db';
const dbPath = path.join(__dirname, '../../', dbFile);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
