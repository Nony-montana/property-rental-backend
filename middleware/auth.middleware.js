const jwt = require("jsonwebtoken");

// CHECK IF USER IS LOGGED IN
const verifyToken = (req, res, next) => {
  try {
    // Check header first, then cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;

    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// CHECK IF USER IS A LANDLORD
const isLandlord = (req, res, next) => {
  if (req.user.role !== "LANDLORD") {
    return res.status(403).json({ message: "Access denied, landlords only" });
  }
  next();
};

module.exports = { verifyToken, isLandlord };