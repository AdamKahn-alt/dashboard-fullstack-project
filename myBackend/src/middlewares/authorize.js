import { stillExistingUser } from "../services/userService.js";

export const authorizeAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    //confirms authenticated-jwt user remains existing in the database
    const ID = req.user.id;
    const matchingUser = await stillExistingUser(ID);
    if (!matchingUser) {
      return res.status(400).json({
        success: false,
        message: "User is not found or not allowed",
      });
    }
    const requester = matchingUser.role;

    if (!["admin", "super-admin"].includes(requester)) {
      return res.status(403).json({
        success: false,
        message: "Access to route denied",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `failed due to error ${error}`,
    });
  }
};

export const authorizeSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    //confirms authenticated-jwt user remains existing in the database
    const ID = req.user.id;
    const matchingUser = await stillExistingUser(ID);
    if (!matchingUser) {
      return res.status(400).json({
        success: false,
        message: "User is not found or not allowed",
      });
    }
    const requester = matchingUser.role;

    if (requester !== "super-admin") {
      return res.status(403).json({
        success: false,
        message: "Access to route denied",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `failed due to error ${error}`,
    });
  }
};

export const authorizeEachUser = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const ID = req.user.id;
    const targetID = req.params.id;

    //confirms authenticated-jwt user remains existing in the database
    const matchingUser = await stillExistingUser(ID);
    if (!matchingUser) {
      return res.status(403).json({
        success: false,
        message: "User is not found or not allowed",
      });
    }
    const requester = matchingUser._id;

    if (String(targetID) !== String(requester)) {
      return res.status(403).json({
        success: false,
        message: `User with ${ID} is not allowed to proceed`,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `failed due to error ${error}`,
    });
  }
};
