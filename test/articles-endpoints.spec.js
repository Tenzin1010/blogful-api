const knex = require('knex')
const app = require('../src/app')
const { makeArticlesArray } = require('./articles.fixtures')
const { makeUsersArray } = require('./users.fixtures')

describe('Articles Endpoints', function() {
  let db

  before('make knex instance', () => {
    console.log(process.env.TEST_DB_URL)
    
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'))


  describe(`GET /api/articles`, () => {
//>>>>>PASS>>>>>
    context(`Given no articles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/articles')
          .expect(200, [])
      })
    })

    context('Given there are articles in the database', () => {
      const testUsers = makeUsersArray(); //users.fixtures.js
      const testArticles = makeArticlesArray(); //articles.fixtures.js

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)    //users.fixtures.js
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles)  //articles.fixtures.js
          })
      })

      it('responds with 200 and all of the articles', () => {
        return supertest(app) //connects with app.js then with articles-router.js is where the test will be compared to the results from the beforeEach() from above. 
          .get('/api/articles')
          .expect(200, testArticles)
      })
    })

    // context(`Given an XSS attack article`, () => {
    //   const testUsers = makeUsersArray();
    //   const { maliciousArticle, expectedArticle } = makeMaliciousArticle()

    //   beforeEach('insert malicious article', () => {
    //     return db
    //       .into('blogful_users')
    //       .insert(testUsers)
    //       .then(() => {
    //         return db
    //           .into('blogful_articles')
    //           .insert([ maliciousArticle ])
    //       })
    //   })

    //   it('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get(`/api/articles`)
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body[0].title).to.eql(expectedArticle.title)
    //         expect(res.body[0].content).to.eql(expectedArticle.content)
    //       })
    //   })
    // })
  })

  describe(`GET /api/articles/:article_id`, () => {
//>>>>PASS>>>>>>    
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles)
          })
      })

      it('responds with 200 and the specified article', () => {
        const articleId = 2
        const expectedArticle = testArticles[articleId - 1]
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(200, expectedArticle)
      })
    })

    // context(`Given an XSS attack article`, () => {
    //   const testUsers = makeUsersArray();
    //   const { maliciousArticle, expectedArticle } = makeMaliciousArticle()

    //   beforeEach('insert malicious article', () => {
    //     return db
    //       .into('blogful_users')
    //       .insert(testUsers)
    //       .then(() => {
    //         return db
    //           .into('blogful_articles')
    //           .insert([ maliciousArticle ])
    //       })
    //   })

    //   it('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get(`/api/articles/${maliciousArticle.id}`)
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body.title).to.eql(expectedArticle.title)
    //         expect(res.body.content).to.eql(expectedArticle.content)
    //       })
    //   })
    // })
  })
//>>>>>PASS>>>>
  describe(`POST /api/articles`, () => {
    const testUsers = makeUsersArray();
    beforeEach('insert malicious article', () => {
      return db
        .into('blogful_users')
        .insert(testUsers)
    })

    it(`creates an article, responding with 201 and the new article`, () => {
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
          // const expected = new Intl.DateTimeFormat('en-US').format(new Date())
          // const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_published))
          // expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/api/articles/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['title', 'style', 'content']

    requiredFields.forEach(field => {
      const newArticle = {
        title: 'Test new article',
        style: 'Listicle',
        content: 'Test new article content...'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newArticle[field]

        return supertest(app)
          .post('/api/articles')
          .send(newArticle)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    // it('removes XSS attack content from response', () => {
    //   const { maliciousArticle, expectedArticle } = makeMaliciousArticle()
    //   return supertest(app)
    //     .post(`/api/articles`)
    //     .send(maliciousArticle)
    //     .expect(201)
    //     .expect(res => {
    //       expect(res.body.title).to.eql(expectedArticle.title)
    //       expect(res.body.content).to.eql(expectedArticle.content)
    //     })
    // })
  })

  describe(`DELETE /api/articles/:article_id`, () => {
  //>>>>>PASS>>>>>>>>>
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .delete(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles)
          })
      })

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

  describe(`PATCH /api/articles/:article_id`, () => {
//>>>>>PASS>>>>>>>>    
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .delete(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })

    context('Given there are articles in the database', () => {
      const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles)
          })
      })

      it('responds with 204 and updates the article', () => {
        const idToUpdate = 2
        const updateArticle = {
          title: 'updated article title',
          style: 'Interview',
          content: 'updated article content',
        }
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send(updateArticle)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .expect(expectedArticle)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'title', 'style' or 'content'`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateArticle = {
          title: 'updated article title',
        }
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }

        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send({
            ...updateArticle,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .expect(expectedArticle)
          )
      })
    })
  })
})

//THE tests will be compared with the articles-router file when executed.
//the test will check to see if the results hold true compared to the article router results
//SERVER ERROR 500 Check article-router.js for server VALIDATION
// const knex = require('knex')
// const app = require('../src/app')
// const { makeArticlesArray } = require('./articles.fixtures')
// const moment = require('moment')
// const { makeUsersArray } = require('./users.fixtures')

// describe('Articles Endpoints', function() {
//   let db

//   before('make knex instance', () => {
//     db = knex({
//       client: 'pg',
//       connection: process.env.TEST_DB_URL,
//     })
//     app.set('db', db)
//   })

//   after('disconnect from db', () => db.destroy())

//   before('clean the table', () => db('blogful_articles').truncate())

//   afterEach('cleanup',() => db('blogful_articles').truncate())

//   //GET /api/articles TEST
//   describe(`GET /api/articles`, () => {
//     context(`Given no articles`, () => {

// //><<<<<<<<<<<<<<<<<PASSED
//       it(`responds with 200 and an empty list`, () => {
//         return supertest(app)
//           .get('/api/articles')
//           .expect(200, [])
//       })
//     })

//     context('Given there are articles in the database', () => {
//       const testArticles = makeArticlesArray()

//       beforeEach('insert articles', () => {
//         return db
//           .into('blogful_articles')
//           .insert(testArticles)
//       })
// //<<<<<<<<<<<<<<<<<<BUG HERE >>>>>>>>>>>>>>>
//       it('responds with 200 and all of the articles', () => {
//         return supertest(app)
//           .get('/api/articles')
//           .expect(200, testArticles)
//       })
//     })
//   })

//   //GET /:article_id TEST
//   describe(`GET /api/articles/:article_id`, () => {
//     context(`Given no articles`, () => {
//       it(`responds with 404`, () => {
//         const articleId = 123456
//         return supertest(app)
//           .get(`/api/articles/${articleId}`)
//           .expect(404, { error: { message: `Article doesn't exist` } })
//       })
//     })

//     context('Given there are articles in the database', () => {
//       const testArticles = makeArticlesArray()

//       beforeEach('insert articles', () => {
//         return db
//           .into('blogful_articles')
//           .insert(testArticles)
//       })
// //<<<<<<<<<<<<<<<<<<BUG HERE >>>>>>>>>>>>>>>
//       it('responds with 200 and the specified article', () => {
//         const articleId = 2
//         const expectedArticle = testArticles[articleId - 1]//?????
//         return supertest(app)
//           .get(`/api/articles/${articleId}`)
//           .expect(200, expectedArticle)
//       })
//     })
//     context(`Given an XSS attack article`, () => {
//       const maliciousArticle = {
//         id: 911,
//         title: 'Naughty naughty very naughty <script>alert("xss");</script>',
//         style: 'How-to',
//         content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
//       }
  
//       beforeEach('insert malicious article', () => {
//         return db
//           .into('blogful_articles')
//           .insert([ maliciousArticle ])
//       })
  
//       it('removes XSS attack content', () => {
//         return supertest(app)
//           .get(`/articles/${maliciousArticle.id}`)
//           .expect(200)
//           .expect(res => {
//             expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
//             expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
//           })
//       })
//     })
//   })

// // POST TEST 
//   describe(`POST /api/articles`, () => {
// //>>>>>>>>>>>>BUG HERE>>>>>>>>>>>>>>>>>
//     it(`creates an article, responding with 201 and the new article`, function() {
//       this.retries(3)
//       const newArticle = {
//         title: 'Test new article',
//         style: 'Listicle',
//         content: 'Test new article content...'
//       }
//       return supertest(app)
//         .post('/api/articles')
//         .send(newArticle)
//         .expect(201)
//         .expect(res => {
//           expect(res.body.title).to.eql(newArticle.title)
//           expect(res.body.style).to.eql(newArticle.style)
//           expect(res.body.content).to.eql(newArticle.content)
//           expect(res.body).to.have.property('id')
//           expect(res.headers.location).to.eql(`/api/articles${res.body.id}`)
//           const expected = new Date().toLocaleString('en', { timeZone: 'UTC' })
//           const actual = new Date(res.body.date_published).toLocaleString()
//           expect(actual).to.eql(expected)
//         })
//         .then(res =>
//           supertest(app)
//             .get(`/api/articles/${res.body.id}`)
//             .expect(res.body)
//         )
//     })
//     it(`responds with 400 and a Error Message when the 'title' is missing`, () => {
//       return supertest(app)
//         .post('/api/articles')
//         .send({
//           style: 'Listicle',
//           content: 'Test new article content'
//         })
//         .expect(400, {
//           error: {message: `Missing 'title' in request body`}
//         })
//     })
//     it(`responds with 400 and an error message when the 'content' is missing`, () => {
//       return supertest(app)
//         .post('/api/articles')
//         .send({
//           title: 'Test new article',
//           style: 'Listicle',
//         })
//         .expect(400, {
//           error: { message: `Missing 'content' in request body` }
//         })
//     })
//     it(`responds with 400 and an error message when the 'style' is missing`, () => {
//       return supertest(app)
//         .post('/api/articles')
//         .send({
//           title: 'Test new article',
//           content: 'Test new article content...'
//         })
//         .expect(400, {
//           error: { message: `Missing 'style' in request body` }
//         })
//     })
    
//     //>>>REFACTORED CODE __this can replace the 400 (missing BODY parts, for title, content or style)
//     // const requiredFields = ['title', 'style', 'content']
//     // requiredFields.forEach(field => {
//     //  const newArticle = {
//     //    title: 'Test new article',
//     //    style: 'Listicle',
//     //    content: 'Test new article content...'
//     //  }

//     //  it(`responds with 400 and an error message when the '${field}' is missing`, () => {
//     //    delete newArticle[field]

//     //    return supertest(app)
//     //      .post('/api/articles')
//     //      .send(newArticle)
//     //      .expect(400, {
//     //        error: { message: `Missing '${field}' in request body` }
//     //      })
//     //  })
//     // })
//   })

//   //DELETE TEST
//   describe(`DELETE /api/articles/:article_id`, () => {
//     context(`Given no articles`, () => {
//       it(`responds with 404`, () => {
//         const articleId = 123456
//         return supertest(app)
//           .delete(`/api/articles/${articleId}`)
//           .expect(404, { error: { message: `Article doesn't exist` } })
//       })
//     })

//     context('Given there are articles in the database', () => {
//       const testArticles = makeArticlesArray()

//       beforeEach('insert articles', () => {
//         return db
//           .into('blogful_articles')
//           .insert(testArticles)
//       })
//       //>>>>>>>BUG>>>>>>>>>>>>>>>
//       it('responds with 204 and removes the article', () => {
//         const idToRemove = 2
//         const expectedArticles = testArticles.filter(article => article.id !== idToRemove)
//         return supertest(app)
//           .delete(`/api/articles/${idToRemove}`)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/articles`)
//               .expect(expectedArticles)
//           )
//       })
//     })
//   })

//   //PATCH TEST
//   describe(`PATCH /api/articles/:article_id`, () => {
//     context(`Given no articles`, () => {
//         //it executes .patch and since articleId doesn't exist, which is checked in articles-router.js
//         //the .all() method is used and that response is 404 anytime ID is not found. 
//         it(`responds with 404`, () => {
//             const articleId = 123456
//             return supertest(app)
//             .patch(`/api/articles/${articleId}`)
//             .expect(400, {error: {message: `Article doesn't exist`}})
//         })
//     })
//     context('Given there are articles in the database', () => {
//         const testArticles = makeArticlesArray()
// //This section inserts the test data in the table
//         beforeEach('insert articles', () => {
//         return db
//             .into('blogful_articles')
//             .insert(testArticles)
//         })
// //Juan whats going on here, this is used in post as well. ???????
//         //We can add code to the articles-router.js to pass this test:
//         //code = is inserted in article-router.js "".patch((req, res) => { res.status(204).end()})
//         it('responds with 204 and updates the article', () => {
// //COMPLETE explanation:  the ID that want to update is id: 2 which will used inthe endpoint api/articles/2
// //and the part we want to update will be title, style & content only(TSC). 
// //so the complete updated article will be = expectedArticle, with id:2, date_published....., & the new values for TSC
// //then we test it by calling supertest(app), method used is .patch, send the new values for TSC
// //204 is request fulfilled by server but no content needs to be returned
// //.then will be used to now test the GET method should be the entire updated article with ID 2 = expectedArticle      
// //the GET will verify if the update passes
//           const idToUpdate = 2
//         const updateArticle = {
//             title: 'updated article title',
//             style: 'Interview',
//             content: 'updated article content',
//         }
//         //the ...spread operator extends the last object after the comma and replaces
//         //the value if it already exists in the previous object
//         //in our case testArticles[1](in the first index of the array), the original title, style, content will be updated by the next values
//         //in the updateArticle object title, style, content. in the .then runs to GET the expectedArticle with the new values for title, style & content 
//         const expectedArticle = {
//           ...testArticles[idToUpdate - 1],
//           ...updateArticle
//         }
//         return supertest(app)
//             .patch(`/api/articles/${idToUpdate}`)
//             .send(updateArticle)
//             .expect(204)
//             .then(res =>
//               //running a GET to check if the ID has been updated
//               supertest(app)
//                 .get(`/api/articles/${idToUpdate}`)
//                 .expect(expectedArticle)
//             )
//         })
//         it('responds with 400 when no required fields are supplied', () => {
//           const idToUpdate = 2
//           return supertest(app)
//             .patch(`/api/articles/${idToUpdate}`)
//             .send({irrelevantField: 'foo'})
//             .expect( 400 , {
//               error: {
//                 message: `Request body must contain either 'title', 'style' or 'content'`
//               }
//             })
//         })
//         it.only(`responds with 204 when updating only a subset of fields`, () => {
//             const idToUpdate = 2
//             const updateArticle = {
//               title: 'updated article title',
//             }
//             const expectedArticle = {
//               ...testArticles[idToUpdate - 1],
//               ...updateArticle
//             }
      
//             return supertest(app)
//               .patch(`/api/articles/${idToUpdate}`)
//               .send({
//                 ...updateArticle,
//                 fieldToIgnore: 'should not be in GET response'
//               })
//               .expect(204)
//               .then(res =>
//                 supertest(app)
//                   .get(`/api/articles/${idToUpdate}`)
//                   .expect({
//                     ...expectedArticle, 
//                     date_published: moment(expectedArticle.date_published).subtract(4, "hours").format("YYYY-MM-DD HH:mm Z")
//                   })
//               )
//         })
        
//     })
//   })
// })
