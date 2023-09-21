const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("../models");
const accounts = db.accounts;
const tokens = db.tokens;
const bcrypt = require("bcrypt");
const salt = bcrypt.genSalt(10);

const { DateTime } = require("luxon");

router.post("/token", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  //Getting of token
  const checkToken = tokens.findOne({ where: { refreshToken: refreshToken } });
  if (refreshToken === null)
    return res
      .status(401)
      .json({ success: false, valid: false, message: "No token included" });
  if (checkToken === null)
    return res
      .status(403)
      .json({ success: false, valid: false, message: "Token not found" });
  if (checkToken && checkToken.active === false)
    return res
      .status(403)
      .json({ success: false, valid: false, message: "Token expired" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ success: false, valid: false, message: "Token invalid" });
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ success: true, valid: true, accessToken: accessToken });
  });
});

router.post("/token/validate", async (req, res) => {
  const accessToken = req.body.accessToken;
  if (accessToken === null) return res.status(401).json({ valid: false });
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ valid: false });
    else return res.status(202).json({ valid: true });
  });
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email !== null && password !== null) {

    const checkAccount = await accounts.findOne({ where: { email: email , active:true } });
    if(checkAccount)
    {
      const validatePassword = await bcrypt.compare(
        password,
        checkAccount.password
      );
  
      if (validatePassword) {
        const user = { name: email };
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        var token = {
          refreshToken,
          active: true,
          account_id: checkAccount.id,
        };
  
        await tokens
          .create(token)
          .then((data) => {
            token.accessToken = accessToken;
            delete token.account_id;
            const userData = Object.assign({}, checkAccount.dataValues, {
              password: undefined,
              createdAt: undefined,
              updatedAt: undefined,
              createdBy: undefined,
              active: undefined,
            });
            res.status(200).json({
              success: true,
              message: "Log in successful",
              userData: userData,
              token: token,
            });
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the token.",
            });
          });
      } else {
        res.status(400).json({ success: false, message: "Invalid Log in" });
      }
    }
    else{
      res.status(400).json({ success: false, message: "Invalid Log in" });
    }
   
  } else {
    res.status(400).json({ success: false, message: "Incomplete fields" });
  }
});
router.delete("/logout", async (req, res) => {
  const refreshToken = req.headers["token"];
  if (refreshToken === null)
    res.status(404).json({ success: false, message: "Empty refresh token" });
  const checkToken = await tokens.findOne({
    where: { refreshToken: refreshToken, active: true },
  });
  if (checkToken) {
    const updatedToken = {
      active: false,
    };
    await tokens
      .update(updatedToken, {
        where: { id: checkToken.id },
      })
      .then(() => {
        res.status(200).json({ success: true, message: "Log out success" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating Account with id=" + id,
        });
      });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Invalid log out. Token not found" });
  }
});
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
}

module.exports = router;
