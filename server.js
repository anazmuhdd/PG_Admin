const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve CSS, JS, Images

// Session setup
app.use(
  session({
    secret: "akhineshmyran",
    resave: false,
    saveUninitialized: true,
  })
);

// Dummy credentials
const USERNAME = "anasmonar@gmail.com";
const PASSWORD = "anuammuaju2022";

// Login route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.loggedIn = true;
    res.redirect("/admin");
  } else {
    res.sendFile(path.join(__dirname, "templates", "login.html"));
  }
});

app.get("/admin", (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
