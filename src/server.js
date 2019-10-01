const knex = require('knex')
const app = require('./app')
const { PORT, DB_URL } = require('./config')

  const db = knex({
    client: 'pg',
    connection: DB_URL,
  })

  //setting an knexInstance in app
  //app.set('property-name', 'property-value')

  app.set('db', db)

app.listen(PORT, () => {
    console.log(`server is listening at http://localhost:${PORT}`)
})
    