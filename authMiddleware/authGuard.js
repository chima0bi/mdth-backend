import jwt from "jsonwebtoken";
import User from "../model/user-model.js";

//AUTHENTICATION MIDDLEWARE; verifies jwt sign if token is prsent against the secret key and if successful attaches the authenticated user to the request.
export const authenticate = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      req.user = user;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Not authenticated, invalid token" });
    }
  } else
    return res
      .status(401)
      .json({ message: "Not authenticated, no token provided" });
};

//Role protectors
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next(); // If the role of user in the request matches the allowed role, proceed
    } else return res.status(403).json({ message: "Access denied" });
  };
};
