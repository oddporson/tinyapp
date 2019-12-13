const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// USER DATABASE - REGISTRATION PAGE
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// EMAIL & PASSWORD LOOK UP
function authenticateUser(email, password){
  for(let key in users){
    if(users[key].email=== email && users[key].password===password){
      return users[key];
    }
  }
  return null;
}

// RANDOM UNIQUE CHARACTER GENERATOR
function generateRandomString(getChars) {
  let result = '';
  let randChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = randChars.length;
  for (let i = 0; i < getChars; i++) {
    result += randChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// app.get("/", (req, res) => {
//   res.send("Hello World! Welcome to Tiny App.");
// });

// SERVER LISTEN PORT 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// INDEX PAGE
app.get("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  console.log("users", users, userID);
  let templateVars = {
    urls: urlDatabase,
    user: user
  };
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

// ENTER TINY URL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  let templateVars = {
    username: req.cookies["username"],
    user: user
  };
  res.render("urls_new", templateVars);
});

// SHORT URL INTO LINK
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user
  };
  res.render("urls_show", templateVars);
});

// REDIRECT TO SHORT URL AFTER GENERATED RANDOM STRING
// CREATE NEW URL THAT GENERATES SHORT URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// EDIT SHORT URL
app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// DELETE URL BUTTON
app.post("/urls/:shortURL/delete", (req, res) => {
  //insert code that delete the short url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});




// LOGIN PAGE
app.get("/user_login", (req, res) => {
  res.render("user_login");
});

// SIGN IN POST
app.post("/login", (req, res) => {
  let result = authenticateUser(req.body.email, req.body.password);
  if(result){
    res.cookie("userID", result.id);
    res.redirect("/urls");
  } else{
    res.send("Error: 403 - Email and password do not match"); // refactored by Rohit
  }
});

// SIGN OUT POST
app.post("/logout", (req, res) => {
  res.clearCookie("userID", req.body.username);
  res.redirect("/urls");
});


// REGISTRATION PAGE
app.get("/user_registration", (req, res) => {
  res.render("user_registration");
});

app.post("/user_registration", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.send("Error 400");
    console.log("Please type in your email and password.");
  } else if (authenticateUser(req.body.email, users)) {
    res.send("Error 400");
    console.log("This email is already existed.");
  } else {
    let newUserID = generateRandomString(6);
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password
    };
    // console.log(users[newUserID]);
    res.cookie("userID", newUserID);
    res.redirect("/urls");
  }
});


