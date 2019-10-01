require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const ArticlesService = require('./articles-service')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors())

//2 endpoints /articles and /articles/:article_id

app.get('/articles', (req, res, next) => {

  const knexInstance = req.app.get('db')
  ArticlesService.getAllArticles(knexInstance)
    .then(articles => {
      res.json(articles.map(article => ({
        id: article.id,
        title: article.title,
        style: article.style,
        content: article.content,
        date_published: new Date(article.date_published),
      })))
    })
    .catch(next)
})
app.get('/articles/:article_id', (req, res, next) => {

  const knexInstance = req.app.get('db')
   ArticlesService.getById(knexInstance, req.params.article_id)
     .then(article => {
        if (!article) {
          return res.status(404).json({
            error: { message: `Article doesn't exist` }
          })
        }
       res.json(article)
     })
     .catch(next)
})


//if the above articles/:article_id doesn't work due to the date use this
// app.get('/articles/:article_id', (req, res, next) => {
//   ArticlesService.getById(
//     req.app.get('db'),
//     req.params.article_id
//   )
//     .then(articles => {
// -       res.json(article)
//       res.json({
//         id: article.id,
//         title: article.title,
//         style: article.style,
//         content: article.content,
//         date_published: new Date(article.date_published),
//       })
//     })
//     .catch(next)
// })

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})
module.exports = app;