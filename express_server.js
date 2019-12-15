const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/* ------------------------------- SERVER LISTEN PORT 8080 ------------------------------- */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


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
  hello: {
    id: "hello",
    email: "h@h",
    password: "123"
  }
};

/* ------------------------------- URL DATABASE ------------------------------- */
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "https://www.google.com",
    userID: "9sm5xK"
  }
};


/* ------------------------------- EMAIL & PASSWORD LOOK UP ------------------------------- */
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
  console.log("users", users, userID);
  let templateVars = {
    urls: urlDatabase,
    user: user
  };
  // console.log(templateVars);
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
  const userID = req.cookies["userID"];
  const user = users[userID];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});

/* ------------------------------- CREATE NEW URL THAT GENERATES SHORT URL ------------------------------- */
app.post("/urls", (req, res) => {
  // TODO: Check if user is logged in
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies.userID};
  res.redirect(`/urls/${shortURL}`);
});

/* ------------------------------- SHORT URL DIRECTS THEM TO LONG URL WEBSITE ------------------------------- */

app.post("/urls/:id", (req, res) => {
  console.log("we are getting on this route");
  console.log(req.body.longURL);


  //update the database with the new updated long url
  urlDatabase[req.params.id].longURL = req.body.longURL;

  //urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/* ------------------------------- USER ONLY - DELETE URL BUTTON  ------------------------------- */
app.post("/urls/:shortURL/delete", (req, res) => {
  //insert code that delete the short url
  console.log("TEST ");
  console.log(urlDatabase[req.params.shortURL].userID);
  console.log(req.cookies["userID"]);

  if (req.cookies["userID"] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(400).send("You can't touch this - MC Hammer");
  }

  // const userID = req.cookies["userID"];
  // console.log('in delete------------->>>>>>', userID);
  // const user = users[userID];
  // console.log('user in delete ------->>>>>', user);
  // const urlObj = urlDatabase[req.params.shortURL]
  // if (user && userID === urlObj.userID) {
  //   delete urlDatabase[req.params.shortURL];
  //   res.redirect("/urls");
  // } else {
  //   res.status(400).send("You can't touch this - MC Hammer");
  // }
});

/* ------------------------------- USER ONY - EDIT URL BUTTON  ------------------------------- */
app.post("/urls/:shortURL/edit", (req, res) => {
  // console.log('shortURL is:', req.params.shortURL);
  const userID = req.cookies.userID;
  // console.log('userID:', userID);
  const user = users[userID];
  // console.log('user:', user);
  const urlObj = urlDatabase[req.params.shortURL];
  // console.log("urlObj:", urlObj);
  if (user && userID === urlObj.userID) {
    // console.log('user ID:', user, "matches shortURL's user");
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    // res.redirect("urls_show");
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.status(400).send("You can't touch this - MC Hammer");
  }
});
//res.redirect("/urls");


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
  if (result) {
    res.cookie("userID", result.id);
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
