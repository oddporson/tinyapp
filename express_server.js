const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/* -------------------------------USER DATABASE -------------------------------*/
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  playerOne: {
    id: "playerOne",
    email: "p1@game.net",
    password: "123"
  }
};

/* ------------------------------- URL DATABASE ------------------------------- */
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user2RandomID"
  },
  "9sm5xK": {
    longURL: "https://www.google.com",
    userID: "playerOne"
  },
  "7db8a2": {
    longURL: "https://www.apple.com/ca/",
    userID: "playerOne"
  },
};


/* --------------------------- EMAIL & PASSWORD LOOK UP ----------------------------- */
function authenticateUser(email, password) {
  for (let key in users) {
    if (users[key].email === email && users[key].password === password) {
      return users[key];
    }
  }
  return null;
}

/* ------------------------------- RANDOM UNIQUE CHARACTER GENERATOR ------------------------------- */
function generateRandomString(getChars) {
  let result = '';
  let randChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = randChars.length;
  for (let i = 0; i < getChars; i++) {
    result += randChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/* ------------------------------- URLS FOR USER ------------------------------- */

const urlsForUser = function(urlDatabase, userID) {
  for (let key in urlDatabase) {
    if (key === urlDatabase[userID].userID); {
      return true;
    }
  }
};

/* ------------------------------- INDEX PAGE ------------------------------- */

app.get("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  let templateVars = {
    urls: urlDatabase,
    user: user
    
  };

  let userUrls = {};
  for (const key in urlDatabase) {
    const url = urlDatabase[key]
    if (url.userID === userID) {
      userUrls[key] = url;
      
    }
  }
  templateVars.urls = userUrls;
  res.render("urls_index", templateVars);
});

/* ------------------------------- TINY URL PAGE ------------------------------- */
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  let templateVars = {
    username: req.cookies["userID"],
    user: user
  };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/user_login");
  }
});

/* ------------------------------- SHORT URL INTO LINK ------------------------------- */
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["userID"]; // this is used to check if there's someone logged in
    if(!userID) {// check if cookies user ID exists
      res.redirect("/user_login")
    } else { //if theyre the owner of the url
      //compare shortUrl's owner to the userId in cookie
      const owner = urlDatabase[req.params.shortURL].userID //give you the owner of the url that you're trying to access
      if(owner !== userID) {
        res.status(400).send('Sorry, you are not the owner of the URL.')
      }
    }
    const user = users[userID]// check if cookies with user ID does not exists then throw an error
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL, //error
      user: user
    };
    res.render("urls_show", templateVars);
});

/* ------------------------------- CREATE NEW URL THAT GENERATES SHORT URL ------------------------------- */
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies.userID};
  res.redirect(`/urls/${shortURL}`);
});

/* ------------------------------- SHORT URL DIRECTS THEM TO LONG URL WEBSITE ------------------------------- */

app.post("/urls/:id", (req, res) => {
  //updates the database with the new updated long url
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/* ------------------------------- USER ONLY - DELETE URL BUTTON  ------------------------------- */
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["userID"] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(400).send("You can't touch this - MC Hammer");
  }
});

/* ------------------------------- USER ONLY - EDIT URL BUTTON  ------------------------------- */
app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.cookies.userID;
  const user = users[userID];
  const urlObj = urlDatabase[req.params.shortURL];
  if (user && userID === urlObj.userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.status(400).send("You can't touch this - MC Hammer");
  }
});
/* ------------------------------- LOGIN PAGE ------------------------------- */
app.get("/user_login", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  let templateVars = {
    user: user
  };
  res.render("user_login", templateVars);
});

/* ------------------------------- LOGIN POST ------------------------------- */
app.post("/login", (req, res) => {
  let result = authenticateUser(req.body.email, req.body.password);
  console.log("this is result:", result);
  if (result) {
    res.cookie("userID", result.id);
    console.log("this is req.cookies:", req.cookies);
    res.redirect("/urls");
  } else {
    res.send("Error: 403 - Email and password do not match"); // refactored by Rohit
  }
});

/* ------------------------------- LOGOUT POST ------------------------------- */
app.post("/logout", (req, res) => {
  res.clearCookie("userID", req.body.username);
  res.redirect("/urls");
});


/* ------------------------------- REGISTRATION PAGE ------------------------------- */
app.get("/user_registration", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  let templateVars = {
    user: user
  };
  res.render("user_registration", templateVars);
});

/* ------------------------------- REGISTRATION POST ------------------------------- */
app.post("/user_registration", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.send("Error 400 - Please type in your email and password.");
  } else if (authenticateUser(req.body.email, users)) {
    res.send("Sorry. This email is already existed.");
  } else {
    let newUserID = generateRandomString(6);
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("userID", newUserID);
    res.redirect("/urls");
  }
});

/* ------------------------------- SERVER LISTEN PORT 8080 ------------------------------- */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
