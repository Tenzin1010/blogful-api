module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
   "connectionString": "postgresql://dunder_mifflin@localhost/blogful-test" 
  //(process.env.NODE_ENV === 'test')
  //    ? process.env.TEST_DB_URL
  //    : process.env.DB_URL,
//enviornment variables messed up. referring to DB that doesn't exist (computer username) process.env.TEST_DB_URL, not set up properly.
}