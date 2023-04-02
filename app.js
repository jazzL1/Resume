const express = require("express");
const app = express();
const path = require("path");
const port = 80;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("public", path.join(__dirname, "public"));

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

const {toDoItem, user} = require('./schemas.js');
const isLoggedIn = require('./middleware.js');
const catchAsync = require('./utilities/catchAsync.js');
const ExpressError = require('./utilities/ExpressError.js');

const passport = require('passport');
const LocalStrategy = require('passport-local');
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

const session = require('express-session');
app.use(session({
    secret: 'ASDFPOIU',
    resave: false,
    saveUninitialized: true,
    }
));
app.use(passport.session());

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const mongoose = require('mongoose');
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/toDoList');
}
main()
.then(() => {console.log('Successfully connected to database')})
.catch(err => console.log(err));


function formatDate(toDoItem) {
  const day = toDoItem.completeBy.getUTCDate();
  const month = toDoItem.completeBy.getUTCMonth() + 1;
  const year = toDoItem.completeBy.getUTCFullYear();
  return `${year}/${month}/${day}`;
};

function sortCategories(categoryArray) {
  categoryArray.sort((toDo1, toDo2) => toDo1.completeBy - toDo2.completeBy || toDo1.priority - toDo2.priority);
}

function defaultDate(toDoItem) {
  let day = toDoItem.completeBy.getUTCDate();
  let month = (toDoItem.completeBy.getUTCMonth() + 1);
  const year = toDoItem.completeBy.getUTCFullYear();
  if(month < 10) {
      month = `0${month}`
  }
  if (day < 10) {
      day = `0${day}`
  }
  return `${year}-${month}-${day}`;
};

app.get("/", (req, res) => {
  res.render("resume");
});



app.get('/toDo', (req, res) => {
  res.render('login');
});

app.post('/toDo', passport.authenticate('local', {failureRedirect: '/toDo'}), (req,res) => {
  res.redirect('/toDo/list');
})

app.get('/toDo/register', (req, res) => {
  res.render('register');
});

app.post('/toDo/register', catchAsync(async (req, res) => {
  try {
      const registeredUser = await user.register(new user({ username : req.body.username}), req.body.password);
      req.logIn(registeredUser, () => {
          res.redirect('/toDo/list');
      });
  } catch (error) {
      res.redirect('/toDo/register');
  }
}));

app.get('/toDo/logout', (req, res) => {
  req.logout(() => {
      res.redirect('/toDo');
  });
  
});

app.get('/toDo/list', isLoggedIn, catchAsync(async (req, res) => {
  const currentUser = req.user;
  const username = currentUser.username;
  const currentUserToDos = await toDoItem.find({user: currentUser});
  const workToDos = []; 
  const personalToDos =[];
  const schoolToDos = [];
  for(toDo of currentUserToDos) {
      if(toDo.category === "work") {
          workToDos.push(toDo);
      }
      else if(toDo.category === "personal") {
          personalToDos.push(toDo);
      }
      else {
          schoolToDos.push(toDo);
      }
  }
  sortCategories(workToDos);
  sortCategories(personalToDos);
  sortCategories(schoolToDos);
  res.render('index', {workToDos, personalToDos, schoolToDos, formatDate, defaultDate, username});
}));

app.post('/toDo/list', isLoggedIn, catchAsync(async (req, res) => {
  const userSubmission =  req.body;
  const newToDo = await new toDoItem({task: userSubmission.task, priority:userSubmission.priority, category: userSubmission.category, completeBy: userSubmission.completeBy, user: req.user});
  await newToDo.save();
  res.redirect('/toDo/list');
}));

app.delete('/toDo/list/:id', isLoggedIn, catchAsync(async (req, res) => {
  if(req.body.complete) {
      await toDoItem.findByIdAndDelete(req.params.id);
  }
  res.redirect('/toDo/list');
}));

app.patch('/toDo/list/:id', isLoggedIn, catchAsync(async (req, res) => {
  const updates = req.body;
  await toDoItem.findByIdAndUpdate(req.params.id, {$set: updates});
  res.redirect('/toDo/list');
}));

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const {statusCode, message} = err;
  res.status(statusCode).send(message);
})









app.listen(port, () => {
  console.log(`Listenting on port ${port}`);
});