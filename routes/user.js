const auth = require("basic-auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../database/query_user");
const config = require("../config/config");

module.exports = (app, connection) => {
  app.post("/authenticate", async (req, res) => {
    const credentials = auth(req);

    if (!credentials) {
      res.status(400).json({ message: "Invalid Request !" });
    } else {
      const { name, pass } = credentials;
      var query = User.findUserQuery(name);
      await connection.query(query, function(error, result) {
        if (error) {
          res.status(500).json({ message: error.message });
        } else if (result.length < 1) {
          res.status(404).json({ message: "No User with that email" });
        } else {
          let user = result[0];
          const hashed_password = user.password;
          if (bcrypt.compareSync(pass, hashed_password)) {
            const token = jwt.sign(
              { status: 200, email: name },
              config.secret,
              { expiresIn: 1440 }
            );
            res.status(200).json({ message: "Login Success", token: token });
          } else {
            res.status(401).json({ message: "Invalid Credentials !" });
          }
        }
      });
    }
  });

  app.post("/users", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Invalid Request !" });
    } else if (!username.trim() || !email.trim() || !password.trim()) {
      res.status(400).json({ message: "Invalid Request !" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hash_password = bcrypt.hashSync(password, salt);

      var query = User.createUserQuery(
        email,
        username,
        hash_password,
        connection.escape(new Date())
      );
      await connection.query(query, function(error, result) {
        if (error) {
          res.status(500).json({ message: error.message });
        } else {
          console.log("User Created");
          res.setHeader("Location", "/users/" + email);
          res.status(200).json({ message: "Success" });
        }
      });
    }
  });
};
