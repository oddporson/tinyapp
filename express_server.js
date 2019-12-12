const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// USER DATABASE
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
}
// EMAIL LOOK UP
const findEmail = function(email, database) {
  for (let keyUsers in database) {
    if (database[keyUsers].email === email) {
      return true;
    }
  }
  return false;
};

// URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// RANDOM UNIQUE CHARACTER GENERATOR
function generateRandomString(getChars) {
  let result           = '';
  let randChars       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = randChars.length;
  for ( let i = 0; i < getChars; i++ ) {
     result += randChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

app.get("/", (req, res) => {
  res.send("Hello World! Welcome to Tiny App.");
});

// sever listening to port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// index page
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"] // TODO: Fix me
  };
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

// enter tiny url page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

// a page that give you the short URL
app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase)
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"] 
  }; 
  res.render("urls_show", templateVars);
});



// REDIRECT TO SHORT URL AFTER GENERATED RANDOM STRING
// CREATE NEW URL THAT GENERATES SHORT URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6)
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);
});

// DELETE URL BUTTON
app.post("/urls/:shortURL/delete", (req, res) => {
  //insert code that delete the short url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

// EDIT URL AFTER CREATING NEW URL
app.post("/urls/:id", (req, res) => {
  //insert code that lets you edit the url then redirect you to urls page
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls")
});

// Redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log('long url: ', longURL)
  res.redirect(longURL);
});

// SIGN IN POST
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  // console.log('fuck', res.cookie);
  res.redirect("/urls");
});

// SIGN OUT POST
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("urls");
})



// REGISTRATION
app.get("/user_registration", (req, res) => {
  res.render("user_registration");
});

app.post("/user_registration", (req, res) => {
  // insert conditional statements
  if (req.body.email === "" || req.body.password === "") {
    res.send("Error 400");
    console.log("Please type in your email and password.")
  } else if (findEmail(req.body.email, users)) {
    res.send("Error 400");
    console.log("This email is aalready existed.")
  } else {

  let newUserID = generateRandomString();
  users[newUserID] = {
    email: req.body.email,
    password: req.body.password
  };
  console.log(users[newUserID])
  res.cookie("userID", newUserID);
  res.redirect("/urls");
}




});
