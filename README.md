# Blogful-api 
Database & EXPRESS

This project was created from express-boilerplate.

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

migrate `npm run migrate --0/1/2 etc`

insert seed to table blogful_articles `psql -U dunder_mifflin -d blogful -f ./seeds/seed.blogful_articles.sql`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.