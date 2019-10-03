//THE tests will be compared with the articles-router file when executed.
//the test will check to see if the results hold true compared to the article router results
const knex = require('knex')
const app = require('../src/app')
const { makeArticlesArray } = require('./articles.fixtures')

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

  describe(`GET /articles`, () => {
    context(`Given no articles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/articles')
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
          .get('/articles')
          .expect(200, testArticles)
      })
    })
  })

  describe(`GET /articles/:article_id`, () => {
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .get(`/articles/${articleId}`)
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
          .get(`/articles/${articleId}`)
          .expect(200, expectedArticle)
      })
    })
  })

//PASSED
  describe(`POST /articles`, () => {
    it(`creates an article, responding with 201 and the new article`, function() {
      this.retries(3)
      const newArticle = {
        title: 'Test new article',
        style: 'Listicle',
        content: 'Test new article content...'
      }
      return supertest(app)
        .post('/articles')
        .send(newArticle)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newArticle.title)
          expect(res.body.style).to.eql(newArticle.style)
          expect(res.body.content).to.eql(newArticle.content)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/articles/${res.body.id}`)
          const expected = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actual = new Date(res.body.date_published).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/articles/${res.body.id}`)
            .expect(res.body)
        )
    })
    it(`responds with 400 and a Error Message when the 'title' is missing`, () => {
      return supertest(app)
        .post('/articles')
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
        .post('/articles')
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
        .post('/articles')
        .send({
          title: 'Test new article',
          content: 'Test new article content...'
        })
        .expect(400, {
          error: { message: `Missing 'style' in request body` }
        })
    })
    
    //this can replace the 400 (missing BODY parts)
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
    //      .post('/articles')
    //      .send(newArticle)
    //      .expect(400, {
    //        error: { message: `Missing '${field}' in request body` }
    //      })
    //  })
    // })
})

// const { expect } = require('chai')
// const knex = require('knex')
// const app = require('../src/app')
// const { makeArticlesArray } = require('./articles.fixtures')

// describe.only('Articles Endpoint', function () {
//     let db

//     //creating the knex instance, executed before any describe
//     before('make Knex instance', () => {
//         db = knex({
//             client: 'pg',
//             connection: process.env.TEST_DB_URL,
//         })
//         app.set('db', db)
//     })

//     //
//     //executed after all the describe has completed
//     after('disconnect from db', () => db.destroy())

//     //
//     before('clean the table', () => db('blogful_articles').truncate())

//     // removes any table data so that the next test has a clean start.
//     afterEach('cleanup', () => db('blogful_articles').truncate())

//     //testing GET endpoint /articles 
//     describe(`GET /articles`, () => {

//         //testing /articles with NO DATA
//         context(`Given no articles`, () => {
//             it(`responds with 200 and an empty list`, () => {
//             return supertest(app)
//                 .get('/articles')
//                 .expect(200, [])
//             })
//         })
//         //testing /articles DATA present
//         context('Given there are articles in the database', () => {
//           const testArticles = makeArticlesArray()
//         //insert data in to table
//         beforeEach('insert articles', () => {
//         return db
//             .into('blogful_articles')
//             .insert(testArticles)
//         })
    
//           it('responds with 200 and all of the articles', () => {
//             return supertest(app)
//               .get('/articles')
//               .expect(200, testArticles)
//           })
//         })
//       })

//     //testing GET endpoint /articles/:article_id
//     describe(`Get /articles/:article_id`, () => {

//         //testing with NO DATA
//         context(`Given no articles`, () => {
//             it(`responds with 404`, () => {
//             const articleId = 123456
//             return supertest(app)
//                 .get(`/articles/${articleId}`)
//                 .expect(404, { error: { message: `Article doesn't exist` } })
//             })
//         })

//         //testing with DATA
//         context('Given there are articles in the DataBase', () => {
//             const testArticles = makeArticlesArray()

//             //populate the table with test data
//             beforeEach('insert articles', () => {
//                 return db
//                     .into('blogful_articles')
//                     .insert(testArticles)
//             })

//             it('GET /article/:article_id responds with 200 and the specified articles', () => {
//                 //whats going on here?????
//                 const articleId = 2
//                 const expectedArticle = testArticles[articleId - 1]
//                 return supertest(app)
//                     .get('./articles/${articleId}')
//                     .expect(200, expectedArticle)
//             })
//         })

//     })

//     //testing POST endpoint /articles
//     //how does creating a endpoing Post /articles in app.js make the test work????????
//     describe.only(`Post /articles`, () => {
//         it(`creates an article, responding with 201 and the new article`, function() {
//             this.retries(3)
            
//             const newArticle = {
//                 title: 'Test new Article',
//                 style: 'Listicle',
//                 content: 'Test new article content'
//             }
//             return supertest(app)
//             .post('/articles')
//             .send(newArticle)
//             .expect(201)
//             .expect( res => {
//                 expect(res.body.title).to.eql.apply(newArticle.title)
//                 expect(res.body.style).to.eql.apply(newArticle.style)
//                 expect(res.body.content).to.eql.apply(newArticle.content)
//                 expect(res.body).to.have.property('id')
//                 expect(res.headers.location).to.eql(`/articles/${res.body.id}`)
//                 const expected = new Date().toLocaleString('en', { timeZone: 'UTC' })
//                 const actual = new Date(res.body.date_published).toLocaleString()
//                 expect(actual).to.eql(expected)
//             })
//             })
//             .then(postRes =>
//                 supertest(app)
//                     .get(`/articles/${postRes.body.id}`)
//                     .expect(postRes.body)
//                     )
//                 })
//               })
//             })

