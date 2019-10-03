//THE tests will be compared with the articles-router file when executed.
//the test will check to see if the results hold true compared to the article router results
const knex = require('knex')
const app = require('../src/app')
const { makeArticlesArray } = require('./api/articles.fixtures')

describe('Articles Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('blogful_articles').truncate())

  afterEach('cleanup',() => db('blogful_articles').truncate())

  //GET /api/articles TEST
  describe(`GET /api/articles`, () => {
    context(`Given no articles`, () => {

//><<<<<<<<<<<<<<<<<PASSED
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/articles')
          .expect(200, [])
      })
    })

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_articles')
          .insert(testArticles)
      })
//<<<<<<<<<<<<<<<<<<BUG HERE >>>>>>>>>>>>>>>
      it('responds with 200 and all of the articles', () => {
        return supertest(app)
          .get('/api/articles')
          .expect(200, testArticles)
      })
    })
  })

  //GET /:article_id TEST
  describe(`GET /api/articles/:article_id`, () => {
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_articles')
          .insert(testArticles)
      })
//<<<<<<<<<<<<<<<<<<BUG HERE >>>>>>>>>>>>>>>
      it('responds with 200 and the specified article', () => {
        const articleId = 2
        const expectedArticle = testArticles[articleId - 1]//?????
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(200, expectedArticle)
      })
    })
  })

// POST TEST 
  describe(`POST /api/articles`, () => {
//>>>>>>>>>>>>BUG HERE>>>>>>>>>>>>>>>>>
    it(`creates an article, responding with 201 and the new article`, function() {
      this.retries(3)
      const newArticle = {
        title: 'Test new article',
        style: 'Listicle',
        content: 'Test new article content...'
      }
      return supertest(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newArticle.title)
          expect(res.body.style).to.eql(newArticle.style)
          expect(res.body.content).to.eql(newArticle.content)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/articles/${res.body.id}`)
          const expected = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actual = new Date(res.body.date_published).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/api/articles/${res.body.id}`)
            .expect(res.body)
        )
    })
    it(`responds with 400 and a Error Message when the 'title' is missing`, () => {
      return supertest(app)
        .post('/api/articles')
        .send({
          style: 'Listicle',
          content: 'Test new article content'
        })
        .expect(400, {
          error: {message: `Missing 'title' in request body`}
        })
    })
    it(`responds with 400 and an error message when the 'content' is missing`, () => {
      return supertest(app)
        .post('/api/articles')
        .send({
          title: 'Test new article',
          style: 'Listicle',
        })
        .expect(400, {
          error: { message: `Missing 'content' in request body` }
        })
    })
    it(`responds with 400 and an error message when the 'style' is missing`, () => {
      return supertest(app)
        .post('/api/articles')
        .send({
          title: 'Test new article',
          content: 'Test new article content...'
        })
        .expect(400, {
          error: { message: `Missing 'style' in request body` }
        })
    })
    
    //>>>REFACTORED CODE __this can replace the 400 (missing BODY parts, for title, content or style)
    // const requiredFields = ['title', 'style', 'content']
    // requiredFields.forEach(field => {
    //  const newArticle = {
    //    title: 'Test new article',
    //    style: 'Listicle',
    //    content: 'Test new article content...'
    //  }

    //  it(`responds with 400 and an error message when the '${field}' is missing`, () => {
    //    delete newArticle[field]

    //    return supertest(app)
    //      .post('/api/articles')
    //      .send(newArticle)
    //      .expect(400, {
    //        error: { message: `Missing '${field}' in request body` }
    //      })
    //  })
    // })
  })

  //DELETE TEST
  describe(`DELETE /api/articles/:article_id`, () => {
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .delete(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_articles')
          .insert(testArticles)
      })
      //>>>>>>>BUG>>>>>>>>>>>>>>>
      it('responds with 204 and removes the article', () => {
        const idToRemove = 2
        const expectedArticles = testArticles.filter(article => article.id !== idToRemove)
        return supertest(app)
          .delete(`/api/articles/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles`)
              .expect(expectedArticles)
          )
      })
    })
  })
})
