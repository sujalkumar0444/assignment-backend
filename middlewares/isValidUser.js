const jwt = require("jsonwebtoken");

module.exports = function authenticate(request, response, next) {
  let jwtToken;
  const authHeader = request.headers["authorization"];

  if (authHeader != undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.status(401).send("No Access Token");
  } else {
    jwt.verify(jwtToken, process.env.JWT_SECRET_KEY, async (error, payload) => {
      if (error) {
        response.status(401).send("Invalid Access Token");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
};