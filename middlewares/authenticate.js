require("dotenv").config()
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.status(401).send({ success: false, message:"Unauthorized" })

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log(err)

    if (err) return res.status(401).send({ success: false, message:"Unauthorized" })

    req.user = user

    next()
  })
}