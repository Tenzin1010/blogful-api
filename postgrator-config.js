module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
  "connectionString": (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL,
    "ssl": !!process.env.SSL,
}

//prior to deploying to database
// module.exports = {
//   "migrationDirectory": "migrations",
//   "driver": "pg",
//   "connectionString": (process.env.NODE_ENV === 'test')
//     ? process.env.TEST_DB_URL
//     : process.env.DB_URL,

// }