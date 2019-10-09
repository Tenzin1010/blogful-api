
const app = require('../src/app')

//runs ok TEST Passed

// GET request from App.js where the test is comparing with......
// app.get('/', (req, res) => {
//   res.send('Hello, World!')
// })

describe('App', () => {
    it('GET / responds with 200 contains, "Hello, World!', () => {
      return supertest(app) 
      .get('/')
      .expect(200, 'Hello, World!')
    })
})