const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeArticlesArray } = require('./articles.fixtures')

describe.only('Articles Endpoint', function () {
    let db

    //creating the knex instance, executed before any describe
    before('make Knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    //
    //executed after all the describe has completed
    after('disconnect from db', () => db.destroy())

    //
    before('clean the table', () => db('blogful_articles').truncate())

    // removes any table data so that the next test has a clean start.
    afterEach('cleanup', () => db('blogful_articles').truncate())

    //testing endpoint /articles 
    describe(`GET /articles`, () => {

        //testing /articles with NO DATA
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
            return supertest(app)
                .get('/articles')
                .expect(200, [])
            })
        })
        //testing /articles DATA present
        context('Given there are articles in the database', () => {
          const testArticles = makeArticlesArray()
        //insert data in to table
        beforeEach('insert articles', () => {
        return db
            .into('blogful_articles')
            .insert(testArticles)
        })
    
          it('responds with 200 and all of the articles', () => {
            return supertest(app)
              .get('/articles')
              .expect(200, testArticles)
          })
        })
      })


      
    //testing endpoint /articles/:article_id
    describe(`Get /articles/:article_id`, () => {

        //testing with NO DATA
        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
            const articleId = 123456
            return supertest(app)
                .get(`/articles/${articleId}`)
                .expect(404, { error: { message: `Article doesn't exist` } })
            })
        })

        //testing with DATA
        context('Given there are articles in the DataBase', () => {
            const testArticles = makeArticlesArray()

            //populate the table with test data
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            })

            it('GET /article/:article_id responds with 200 and the specified articles', () => {
                //whats going on here?????
                const articleId = 2
                const expectedArticle = testArticles[articleId - 1]
                return supertest(app)
                    .get('./articles/${articleId}')
                    .expect(200, expectedArticle)
            })
        })

    })

})

