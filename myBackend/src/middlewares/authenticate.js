import jwt from "jsonwebtoken";

export const authenticate = async (req, res, next) => {
  try {
    // console.log("Authenticating user...");
    // console.log("req:", req.cookies);
    // const authHeader = req.headers.authorization;
    // console.log(`Token: ${token}`);

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          console.log(`Error: ${err}`);
          const newError = new Error(
            `Invalid or expired token required for authentication: ${err}`,
          );
          newError.status = 401;
          reject(newError);
        } else {
          resolve(decoded);
        }
      });
    });
    // const decodedToken = jwt.verify(token, process.env.SECRET);

    // console.log("Decoded token:", decodedToken)

    req.user = decodedToken;
    // console.log("User authenticated:", req.user);
    next();
  } catch (error) {
    console.log(`Authentication error: ${error}`);
    console.log(`Authentication status: ${error.status}`);
    res.status(error.status || 500).json({
      success: false,
      message: `failed due to error: ${error.message}`,
    });
  }
};
