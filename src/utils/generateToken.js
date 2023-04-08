const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const token = jwt.sign({ payload }, "yoursupersercret", {
    expiresIn: "1d",
  });
  return token;
};

module.exports = generateToken;
