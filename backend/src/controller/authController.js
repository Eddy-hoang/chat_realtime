import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m"; //thường dưới 15p - deloy chỉnh lại
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; //14 ngày

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message: "Miss username,password, email, firstName, lastName",
      });
    }

    // Check duplicate username
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Check duplicate email
    const emailDuplicate = await User.findOne({ email });
    if (emailDuplicate) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      username,
      hashPassword: hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error signUp", error);
    return res.status(500).json({ message: "ERROR SYSTEM" });
  }
};

export const signIn = async (req, res) => {
  try {
    //lấy inputs
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    //lấy hashPasswork trong db để so sánh với password input
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashPassword);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }
    //khớp thì, tạo accesssToken với JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    //tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    //tạo session mới để lưu refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    //trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", //backend, frontend deploy riêng
      maxAge: REFRESH_TOKEN_TTL,
    });

    //trả access token về res
    return res
      .status(200)
      .json({
        message: `User ${user.displayName} logged in success!`,
        accessToken,
      });
  } catch (error) {
    console.error("Error signIp", error);
    return res.status(500).json({ message: "ERROR SYSTEM" });
  }
};

export const sigOut = async (req, res) => {
  try {
    // lấy refrech token từ cookie
    const token = req.cookie?.refreshToken;
    if (token) {
      // xóa refrech token trong Session
      await Session.deleteOne({refreshToken:token});
      // xóa cookie
      res.clearCookie("refreshToken")
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error signIp", error);
    return res.status(500).json({ message: "ERROR SYSTEM" });
  }
};
