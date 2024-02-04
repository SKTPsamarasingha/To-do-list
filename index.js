import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import validator from "validator";
import db from "./DB/db.js";

const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//task user enter
let data;
//user id in  db
let userID = 24;
app.get("/", async (req, res) => {
  res.render("login.ejs");
});
//
//
app.get("/signUp", (req, res) => {
  res.render("sign.ejs");
});
//
//
app.post("/signUp", async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const valEmail = emailValidate(email);
  const valPassword = passwordValidate(password);
  let err = "";
  let verified = false;
  try {
    const salt = await bcrypt.genSalt(10);
    const foundUser = await db.getUser(email);

    if (foundUser === null) {
      if (!valEmail) {
        err = "Invalid email please";
      } else {
        if (!valPassword) {
          err = "Invalid password";
        } else {
          verified = true;
        }
      }
    } else {
      err = "User Found please try login";
    }
    ////////////////////////////////
    if (verified) {
      const hash = await bcrypt.hash(password, salt);
      await db.addUser(email, hash);
      res.redirect("/");
    } else {
      res.render("sign.ejs", { error: err });
    }
  } catch (error) {
    console.log(error);
  }
});
//
//
//
app.post("/login", async (req, res) => {
  const email = req.body.email.trim();
  const userPass = req.body.password.trim();
  try {
    const result = await loginVerified(email, userPass);
    const verified = result.verified;
    const userID = result.id;

    if (verified) {
      data = await db.getTask(userID);
      res.render("index.ejs", { input: data });
    } else {
      res.render("login.ejs", { error: result });
    }
  } catch (error) {
    console.log(error);
  }
});
//
//
app.get("/home", async (req, res) => {
  try {
    data = await db.getTask(userID);
    res.render("index.ejs", { input: data });
  } catch (error) {
    console.log(error);
  }
});
//
//add task
app.post("/add", async (req, res) => {
  let input = req.body.userInput;

  try {
    if (input === "") {
      const err = "Empty task, Please enter a task";
      res.render("index.ejs", { input: data, error: err });
    } else {
      await db.addTask(input, userID);
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error);
  }
});
//
//delete task
app.post("/delete", async (req, res) => {
  const input = req.body.itemValue;
  try {
    await db.deleteTask(input);
    res.redirect("/home");
  } catch (error) {
    console.log(error);
  }
});
//
//edit task
app.post("/edit", async (req, res) => {
  let id = req.body.itemId;
  let task = req.body.itemTask;
  try {
    await db.deleteTask(id);
    res.render("index.ejs", { input: data, editTask: task });
  } catch (error) {
    console.log(error);
  }
});
//
//
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
/****************************************************************************/
const emailValidate = (email) => {
  if (!validator.isEmail(email)) {
    return false;
  } else {
    return true;
  }
};
const passwordValidate = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (
    !validator.matches(password, passwordRegex) &&
    !validator.isLength(password, { min: 8, max: 30 })
  ) {
    return false;
  } else {
    return true;
  }
};

const loginVerified = async (email, userPass) => {
  let data = { verified: false, id: userID };

  try {
    if (!emailValidate(email)) {
      return "Invalid email";
    } else {
      //getting user data from DB
      const user = await db.getUser(email);

      if (user !== null) {
        userID = user[0].id;
        // comparing  store password and input password
        const userVerify = await bcrypt.compare(userPass, user[0].password);

        if (userVerify) {
          data.verified = true;
          data.id = userID;
          return data;
        } else {
          return "Wrong password try again";
        }
      } else {
        return "Wrong email try again";
      }
    }
  } catch (error) {
    console.log(error);
  }
};
