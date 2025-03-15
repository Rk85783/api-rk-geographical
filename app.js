import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.config.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticate, authorize } from "./middlewares/auth.middleware.js";
import { sendMail } from "./services/email.service.js";
import { FORGOT_PASSWORD_MAIL, VERIFICATION_MAIL } from "./config/email.config.js";
import path from 'path';
import { fileURLToPath } from 'url';
import Shipper from "./models/Shipper.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set('views', path.resolve(__dirname, 'views'));

// Database Connection
connectDB();

// -----> configs-list
app.get("/api/configs-list", async (req, res) => {
  try {
    const [
      topCompaniesByRegions,
      topCompaniesByShipmentTypes,
      truckTypes,
      shipmentTypes,
      specializedServices,
      freights,
      safetyRatings,
      operations,
      insuranceMinimum,
      authorityMaintained
    ] = await Promise.all([
      mongoose.connection.db.collection("top-companies-by-region").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("top-companies-by-shipment-type").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("truck-type").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("shipment-type").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("specialized-service").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("freight").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("safety-rating").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("operation").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("insurance-minimum").find().sort({ id: 1 }).toArray(),
      mongoose.connection.db.collection("authority-maintained").find().sort({ id: 1 }).toArray(),
    ]);
    res.status(200).json({
      topCompaniesByRegions,
      topCompaniesByShipmentTypes,
      truckTypes,
      shipmentTypes,
      specializedServices,
      freights,
      safetyRatings,
      operations,
      insuranceMinimum,
      authorityMaintained
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// -----> Countries
app.get("/api/countries", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'name', order = 'asc', ...filters } = req.query;
    const sortOrder = order === 'asc' ? 1 : -1;

    const filterConditions = {};
    for (const [key, value] of Object.entries(filters)) {
      filterConditions[key] = new RegExp(value, 'i');
    }

    const [totalCount, data] = await Promise.all([
      mongoose.connection.db.collection("countries").countDocuments(filterConditions),
      mongoose.connection.db.collection("countries").find(filterConditions)
        .sort({ [sort]: sortOrder })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .toArray()
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ totalPages, totalCount, currentPage: parseInt(page), data });
  } catch (error) {
    res.status(500).json(error);
  }
});

// -----> States
app.get("/api/states", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'name', order = 'asc', ...filters } = req.query;
    const sortOrder = order === 'asc' ? 1 : -1;

    const filterConditions = {};
    for (const [key, value] of Object.entries(filters)) {
      filterConditions[key] = new RegExp(value, 'i');
    }

    const [totalCount, data] = await Promise.all([
      mongoose.connection.db.collection("states").countDocuments(filterConditions),
      mongoose.connection.db.collection("states").find(filterConditions)
        .sort({ [sort]: sortOrder })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .toArray()
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ totalPages, totalCount, currentPage: parseInt(page), data });
  } catch (error) {
    res.status(500).json(error);
  }
});

// -----> Cities
app.get("/api/cities", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'name', order = 'asc', ...filters } = req.query;
    const sortOrder = order === 'asc' ? 1 : -1;

    const filterConditions = {};
    for (const [key, value] of Object.entries(filters)) {
      filterConditions[key] = new RegExp(value, 'i');
    }

    const [totalCount, data] = await Promise.all([
      mongoose.connection.db.collection("cities").countDocuments(filterConditions),
      mongoose.connection.db.collection("cities").find(filterConditions)
        .sort({ [sort]: sortOrder })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .toArray()
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ totalPages, totalCount, currentPage: parseInt(page), data });
  } catch (error) {
    res.status(500).json(error);
  }
});

// -----> Carriers
app.get("/api/carriers", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'dotNumber', order = 'asc', ...filters } = req.query;
    const sortOrder = order === 'asc' ? 1 : -1;

    const filterConditions = {};
    for (const [key, value] of Object.entries(filters)) {
      filterConditions[key] = new RegExp(value, 'i');
    }

    const [totalCount, data] = await Promise.all([
      mongoose.connection.db.collection("carriers").countDocuments(filterConditions),
      mongoose.connection.db.collection("carriers").find(filterConditions)
        .sort({ [sort]: sortOrder })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .toArray()
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ totalPages, totalCount, currentPage: parseInt(page), data });
  } catch (error) {
    res.status(500).json(error);
  }
});

// -----> Carrier Profile
app.get("/api/carriers/:carrierPkId", async (req, res) => {
  try {
    const { carrierPkId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carrierPkId)) {
      return res.status(400).json({ success: false, message: "Invalid carrier ID format" });
    }

    const carrier = await mongoose.connection.db.collection("carriers").findOne({
      _id: new mongoose.Types.ObjectId(carrierPkId)
    });

    if (!carrier) return res.status(404).json({ success: false, message: "Carrier not found" });

    res.status(200).json({ success: true, message: "Carrier details fetched successfully", carrier });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Register -- old
// app.post("/api/auth/register", async (req, res) => {
//   const { firstName, lastName, email, password, role, dotNumber } = req.body;

//   // Start a new session for the transaction
//   const session = await mongoose.startSession();

//   try {
//     // Start transaction
//     session.startTransaction();

//     const existingUser = await User.findOne({ email }).session(session);
//     if (existingUser) {
//       await session.abortTransaction();
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     const newUser = await User.create([{
//       firstName,
//       lastName,
//       email,
//       password: bcrypt.hashSync(password, 10),
//       role
//     }], { session });

//     if (role === 'carrier') {
//       if (!dotNumber) {
//         await session.abortTransaction();
//         return res.status(400).json({ success: false, message: "Please provide dotNumber" });
//       }

//       const carrierExists = await mongoose.connection.db.collection("carriers")
//         .findOne({ dotNumber }, { session });

//       if (!carrierExists) {
//         await session.abortTransaction();
//         return res.status(400).json({ success: false, message: "Invalid DOT number" });
//       }

//       await mongoose.connection.db.collection("carriers").updateOne(
//         { dotNumber },
//         {
//           $set: {
//             email,
//             registrationDateTime: new Date(),
//             userId: new mongoose.Types.ObjectId(newUser[0]._id)
//           }
//         },
//         { session }
//       );
//     }

//     // Commit the transaction
//     await session.commitTransaction();

//     res.status(201).json({ success: true, message: "You are successfully registered" });
//   } catch (error) {
//     // Abort transaction on error
//     await session.abortTransaction();
//     console.log(error);
//     res.status(500).json({ success: false, message: "Internal server error", error: { message: error.message, stack: error.stack } });
//   } finally {
//     // End session
//     session.endSession();
//   }
// });

// -----> Register -- new
app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password, 10)
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const emailData = {
      recieverEmail: user.email,
      subject: `Verify Your Email on ${process.env.APP_NAME}`,
      emailTemplatePath: VERIFICATION_MAIL,
      templateData: {
        appName: process.env.APP_NAME,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationLink: `${process.env.FRONTEND_URL}/verify?email=${user.email}&id=${user._id}`
      }
    }
    sendMail(emailData);

    res.status(201).json({ success: true, message: "You are successfully registered", token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: { message: error.message, stack: error.stack } });
  }
});

// -----> Resend Verification Mail
app.post("/api/auth/resend-verification-mail", authenticate, authorize(["user"]), async (req, res) => {
  const { _id, email } = req.user;
  try {
    const user = await User.findOne({ _id, email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: "Email is already verified" });

    const emailData = {
      recieverEmail: email,
      subject: `Verify Your Email on ${process.env.APP_NAME}`,
      emailTemplatePath: VERIFICATION_MAIL,
      templateData: {
        appName: process.env.APP_NAME,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationLink: `${process.env.FRONTEND_URL}/verify?email=${email}&id=${_id}`
      }
    }
    sendMail(emailData);

    res.status(200).json({ success: true, message: "Verificaiton mail resend successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: { message: error.message, stack: error.stack } });
  }
});

// -----> Verify Email
app.post("/api/auth/verify-email", authenticate, authorize(["user"]), async (req, res) => {
  const { email, id } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    if (email != req.user.email || id != req.user._id) return res.status(400).json({ success: false, message: "Verification details and logged in users details not match" });

    const user = await User.findOne({ email, _id: id });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: "Email is already verified" });

    user.isEmailVerified = true;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: "Email verified successfully", token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: { message: error.message, stack: error.stack } });
  }
});

// -----> Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password').lean();
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ success: false, message: "Email or Password is Incorrect" });
    delete user.password

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: "You are successfully logged in", token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Forgot Password
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const emailData = {
      recieverEmail: user.email,
      subject: `Change your ${process.env.APP_NAME} password`,
      emailTemplatePath: FORGOT_PASSWORD_MAIL,
      templateData: {
        appName: process.env.APP_NAME,
        verificationLink: `${process.env.FRONTEND_URL}/reset-password?email=${user.email}&id=${user._id}`
      }
    }
    sendMail(emailData);

    res.status(200).json({ success: true, message: "Email reset link sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Reset Password  
app.post("/api/auth/reset-password", async (req, res) => {
  const { id, email, password } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const user = await User.findOne({ email, _id: id }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    user.password = bcrypt.hashSync(password, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Profile
app.get("/api/auth/profile", authenticate, authorize(["user"]), async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, message: "User details fetched successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Assign Role
app.post("/api/auth/assign-role", authenticate, authorize(["user"]), async (req, res) => {
  const { role, companyName, city, state, country } = req.body
  try {
    const user = req.user;
    if (!user.isEmailVerified) return res.status(400).json({ success: false, message: "Please verify your email first" });

    const updatedUser = await User.findByIdAndUpdate(user._id, { role }, { new: true });
    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    if (role === 'shipper') {
      await Shipper.create({
        user: updatedUser._id,
        companyName,
        city,
        state,
        country
      });
    }

    res.status(200).json({ success: true, message: "User details udpated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Shipper Profile
app.get("/api/shippers/profile", authenticate, authorize(["shipper"]), async (req, res) => {
  try {
    const user = req.user;
    if (!user.isEmailVerified) return res.status(404).json({ success: false, message: "Please verify email first" });

    const shipper = await Shipper.findOne({ user: user._id }).populate({ path: "user", match: { role: "shipper" }, select: "firstName lastName email role", lean: true }).lean();
    if (!shipper) return res.status(404).json({ success: false, message: "Shipper not found" });

    res.status(200).json({ success: true, message: "User details fetched successfully", shipper });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`App is running at http://localhost:${PORT}`));