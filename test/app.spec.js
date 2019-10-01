
const app = require('../src/app')

describe('App', () => {
    it('GET / responds with 200 contains, "Hello, World!', () => {
      return supertest(app) 
      .get('/')
      .expect(200, 'Hello, World!')
    })
})