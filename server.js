const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const PORT = 8000;
const UserSignUpModel = require('./Models/UserSignup');

const app = express();
app.use(express.json());
app.use(cors());

// mongoDb connection
mongoose.connect("mongodb://127.0.0.1:27017/NutriHive", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

app.post('/signup', async (req, res) => {
  try {
    const existingUser = await UserSignUpModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json("User exists");
    }

    const newRegistration = await UserSignUpModel.create(req.body);
    console.log(newRegistration);
    return res.status(200).json(newRegistration);

  } catch (error) {
    console.error(error);
    return res.status(500).json("Server Error");
  }
});

// login routing
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserSignUpModel.findOne({ email: email });

    if (user) {
      if (user.password === password) {
        res.json("Login Successful !");
      } else {
        res.json("Incorrect Password !");
      }
    } else {
      res.json("User not found !");
    }
  } catch (error) {
    res.json("Error in login: " + error);
  }
});

app.post("/forgotpassword", (req, res) => {
  const { email } = req.body;
  UserSignUpModel.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }
      const token = jwt.sign({ id: user.id }, "jwt_secret_key", { expiresIn: "1d" });

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'adityab76@gmail.com',
          pass: 'opin lxpc mtjg agnb'
        }
      });

      var mailOptions = {
        from: 'NutriHive@gmail.com',
        to: 'adityab76@gmail.com',
        subject: 'Password Reset Link',
        text: `http://localhost:3000/resetpassword/${user.id}/${token}`
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.status(500).json({ status: "Error sending email" });
        } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).json({ status: "Email sent successfully" });
        }
      });
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({ status: "Server Error" });
    });
});


app.post("/resetpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    jwt.verify(token, "jwt_secret_key", async (err, decode) => {
      if (err) {
        res.json({ Status: "Error with token" });
      } else {
        try {
          const hash = await bcrypt.hash(password, 10);
          await UserSignUpModel.findByIdAndUpdate(id, { password: hash });
          res.send({ Status: "Success" });
        } catch (error) {
          res.send({ Status: error });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ Status: "Error with token" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on Port Number ${PORT}`);
});
