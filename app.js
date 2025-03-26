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
import { FORGOT_PASSWORD_MAIL, VERIFICATION0_MAIL_FOR_OTHER_EMAIL, VERIFICATION_MAIL } from "./config/email.config.js";
import path from 'path';
import { fileURLToPath } from 'url';
import Shipper from "./models/Shipper.js";
import Carrier from "./models/Carrier.js";
import List from "./models/List.js";
import Contact from "./models/Contact.js";
import Blog from "./models/Blog.js";
import EmailAddress from "./models/EmailAddress.js";

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

// -----> Project info
import { readFileSync } from "fs";
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf8"));
const { name, version, description, author, license } = packageJson;
app.get("/api", async (req, res) => {
  res.status(200).json({ name, version, description, author, license });
});

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

// -----> Get All Carriers
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
app.get("/api/carriers/me", authenticate, authorize(["carrier"]), async (req, res) => {
  try {
    const user = req.user;
    if (!user.isEmailVerified) return res.status(404).json({ success: false, message: "Please verify email first" });

    const carrier = await Carrier.findOne({ user: user._id }).populate({ path: "user", match: { role: "carrier" }, lean: true }).lean();
    if (!carrier) return res.status(404).json({ success: false, message: "Carrier not found" });

    res.status(200).json({ success: true, message: "Carrier profile detail fetched successfully", carrier });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Get Single Carrier
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
    await EmailAddress.create({ user: user._id, email });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const emailData = {
      recieverEmail: user.email,
      subject: `Verify Your Email on ${process.env.APP_NAME}`,
      emailTemplatePath: VERIFICATION_MAIL,
      templateData: {
        appName: process.env.APP_NAME,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationLink: `${process.env.FRONTEND_LOCAL_URL}/verify?email=${user.email}&id=${user._id}`
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
        verificationLink: `${process.env.FRONTEND_LOCAL_URL}/verify?email=${email}&id=${_id}`
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

    await EmailAddress.updateOne({ email: user.email, user: user._id }, { $set: { isPrimary: true, isVerified: true } });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: "Email verified successfully", token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: { message: error.message, stack: error.stack } });
  }
});

// -----> Verify Others Email
app.post("/api/auth/verify-others-email", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const { email, id } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID format" });
    if (id != req.user._id) return res.status(400).json({ success: false, message: "Verification details and logged in users details not match" });

    const emailAddress = await EmailAddress.findOne({ email, user: id });
    if (!emailAddress) return res.status(400).json({ success: false, message: "User not found" });
    if (emailAddress.isVerified) return res.status(400).json({ success: false, message: "Email is already verified" });

    emailAddress.isVerified = true;
    await emailAddress.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
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
        verificationLink: `${process.env.FRONTEND_LOCAL_URL}/reset-password?email=${user.email}&id=${user._id}`
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
app.get("/api/auth/profile", authenticate, authorize(["user", "carrier", "shipper"]), async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, message: "User details fetched successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Assign Role
app.post("/api/auth/assign-role", authenticate, authorize(["user"]), async (req, res) => {
  const { role, companyName, city, state, country, dotNumber } = req.body
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
    } else if (role === 'carrier') {
      await Carrier.findOneAndUpdate(
        { dotNumber },
        {
          user: updatedUser._id,
        },
        { new: true }
      )
    }

    res.status(200).json({ success: true, message: "User details udpated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Get Shipper Profile
app.get("/api/shippers/me", authenticate, authorize(["shipper"]), async (req, res) => {
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

// -----> Update Shipper Profile
app.put("/api/shippers/profile-update", authenticate, authorize(["shipper"]), async (req, res) => {
  const user = req.user;
  const { firstName, lastName, companyName } = req.body;
  try {
    if (!user.isEmailVerified) return res.status(404).json({ success: false, message: "Please verify email first" });

    const shipper = await Shipper.findOne({ user: user._id }).populate({
      path: "user",
      match: { role: "shipper" },
      select: "firstName lastName email role",
      lean: true,
    }).lean();

    if (!shipper) return res.status(404).json({ success: false, message: "Shipper not found" });

    await Promise.all([
      Shipper.findOneAndUpdate(
        { _id: shipper._id },
        { companyName }
      ),
      User.findOneAndUpdate(
        { _id: shipper.user._id },
        { firstName, lastName }
      ),
    ]);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// -----> Update Carrier Profile
app.put("/api/carriers/profile-update", authenticate, authorize(["carrier"]), async (req, res) => {
  const user = req.user;
  const { firstName, lastName, companyName } = req.body;
  try {
    if (!user.isEmailVerified) return res.status(404).json({ success: false, message: "Please verify email first" });

    const carrier = await Carrier.findOne({ user: user._id }).populate({
      path: "user",
      match: { role: "carrier" },
      select: "firstName lastName email role",
      lean: true,
    }).lean();

    if (!carrier) return res.status(404).json({ success: false, message: "Carrier not found" });

    await Promise.all([
      Carrier.findOneAndUpdate(
        { _id: carrier._id },
        { legalName: companyName }
      ),
      User.findOneAndUpdate(
        { _id: carrier.user._id },
        { firstName, lastName }
      ),
    ]);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

app.get("/api/external/search", async (req, res) => {
  try {
    const query = req.query.q || "";

    const carrierFilterConditions = {
      $or: [
        { dotNumber: { $regex: query, $options: "i" } },
        { legalName: { $regex: query, $options: "i" } },
      ],
    };

    const carriers = await Carrier.find(carrierFilterConditions)
      .select("legalName dotNumber phyCity phyState phyCountry phyZip driverTotal nbrPowerUnit")
      .sort({ dotNumber: 1 })
      .limit(5);

    const cities = await Carrier.aggregate([
      {
        $match: {
          $or: [
            { phyCity: { $regex: query, $options: "i" } },
            { phyState: { $regex: query, $options: "i" } },
            { phyCountry: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: {
            city: "$phyCity",
            state: "$phyState",
            country: "$phyCountry",
          },
          zipCodes: { $push: "$phyZip" },
        },
      },
      {
        $project: {
          city: "$_id.city",
          state: "$_id.state",
          country: "$_id.country",
          zipCodes: 1,
          _id: 0,
        },
      },
      { $sort: { city: 1, state: 1, country: 1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      cities,
      carriers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.get("/api/external/carrier-search-for-review", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "dotNumber", order = "asc", q = req.query.q = "" } = req.query;

    const sortOrder = order === "asc" ? 1 : -1;

    const carrierFilterConditions = {
      $or: [
        { dotNumber: { $regex: q, $options: "i" } },
        { legalName: { $regex: q, $options: "i" } },
      ],
    };

    if (!isNaN(Number(q))) {
      carrierFilterConditions.$or.push({ dotNumber: Number(q) });
    }

    const [totalCount, carriers] = await Promise.all([
      Carrier.countDocuments(carrierFilterConditions),
      Carrier.find(carrierFilterConditions)
        .select("legalName dotNumber phyCity phyState phyCountry phyZip driverTotal nbrPowerUnit")
        .sort({ [sort]: sortOrder })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      totalPages,
      totalCount,
      currentPage: parseInt(page),
      carriers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ---------------> Get all lists
app.get("/api/lists", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const user = req.user;
  const { carrierId } = req.query;

  try {
    const query = carrierId
      ? { user: user._id, carriers: new mongoose.Types.ObjectId(carrierId) }
      : { user: user._id };

    const listsWithCarrierCount = await List.aggregate([
      { $match: query },
      {
        $addFields: {
          carriersCount: { $size: "$carriers" },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Lists fetched successfully",
      lists: listsWithCarrierCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ---------------> Get a list
app.get("/api/lists/:listId", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const { _id: userId } = req.user;
  const { listId } = req.params;
  try {
    const list = await List.findOne({ _id: listId, user: userId }).lean();
    if (!list) return res.status(404).json({ success: false, message: "List not found" });

    const carriers = await Carrier.find({ _id: { $in: list.carriers } }).lean();

    res.status(200).json({
      success: true,
      message: "List carriers fetched successfully",
      carriers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ---------------> Create a list
app.post("/api/lists", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const user = req.user;
  const { name } = req.body;
  try {
    await List.create({ user: user._id, name });
    res.status(200).json({ success: true, message: "New list added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ---------------> Edit a list
app.put("/api/lists/:id", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedList = await List.findOneAndUpdate({ _id: id, user: user._id }, { $set: { name } }, { new: true }).lean();
    if (!updatedList) return res.status(404).json({ success: false, message: "List not found" });
    res.status(200).json({ success: true, message: "List updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ---------------> Delete a list
app.delete("/api/lists/:id", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const deletedList = await List.findOneAndDelete({ _id: id, user: user._id, isPrimary: false }).lean();
    if (!deletedList) return res.status(404).json({ success: false, message: "List not found" });
    res.status(200).json({ success: true, message: "List deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ---------------> Add a carrier into a list
app.post("/api/lists/:listId/carriers/:carrierId", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const { _id: userId } = req.user;
  const { listId, carrierId } = req.params;
  try {
    const updatedList = await List.findOneAndUpdate({ _id: listId, user: userId }, { $addToSet: { carriers: carrierId } }, { new: true }).lean();
    if (!updatedList) return res.status(404).json({ success: false, message: "List not found" });
    res.status(200).json({ success: true, message: "Carrier added in list successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ---------------> Remove a carrier form a list
app.delete("/api/lists/:listId/carriers/:carrierId", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const { _id: userId } = req.user;
  const { listId, carrierId } = req.params;
  try {
    const updatedList = await List.findOneAndUpdate({ _id: listId, user: userId }, { $pull: { carriers: carrierId } }, { new: true }).lean();
    if (!updatedList) return res.status(404).json({ success: false, message: "List not found" });
    res.status(200).json({ success: true, message: "Carrier removed from list successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

app.post("/api/auth/change-password", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const { email } = req.user;
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    user.password = hash;
    user.save();
    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(200).json({ success: true, message: "Internal server error", error: error.message, stack: error.stack });
  }
});

// --------------> Contact
app.post("/api/contact", async (req, res) => {
  const { firstName, lastName, companyName, email, message, role, consent: isSubscribed } = req.body;
  try {
    await Contact.create({ firstName, lastName, companyName, email, message, role, isSubscribed });
    res.status(201).json({ success: true, message: "Contact form submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// --------------> Blogs
app.post("/api/blogs", authenticate, authorize(["admin"]), async (req, res) => {
  const { title, content, tags, isPublished, featuredImage } = req.body;
  try {
    const blog = await Blog.create({
      title,
      content,
      author: req.user._id,
      tags,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      featuredImage
    });
    res.status(200).json({ success: true, message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

app.get("/api/blogs", async (req, res) => {
  const { page = 1, limit = 10, sort = "publishedAt", order = "desc", ...filters } = req.query;
  const sortOrder = order === "asc" ? 1 : -1;

  const filterConditions = {};
  for (const [key, value] of Object.entries(filters)) {
    if (key === "isPublished") {
      filterConditions[key] = value === "true";
    } else {
      filterConditions[key] = new RegExp(value, "i");
    }
  }

  const skip = (Math.max(0, page - 1)) * limit;

  try {
    const [totalCount, blogs] = await Promise.all([
      Blog.countDocuments(filterConditions),
      Blog.find(filterConditions)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("author", "firstName lastName email role")
        .lean(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({
      totalPages,
      totalCount,
      currentPage: parseInt(page),
      blogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

app.get("/api/blogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findOne({ _id: id }).populate("author", "firstName lastName email role").lean();
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, message: "Blog fetched successfully", blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

app.put("/api/blogs/:id", authenticate, authorize(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, isPublished, featuredImage } = req.body;
  try {
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title,
          content,
          author: req.user._id,
          tags,
          isPublished,
          publishedAt: isPublished ? new Date() : null,
          featuredImage
        }
      },
      { new: true }
    ).lean();
    if (!updatedBlog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, message: "Blog updated successfully", updatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

app.delete("/api/blogs/:id", authenticate, authorize(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBlog = await Blog.findOneAndDelete({ _id: id }).lean();
    if (!deletedBlog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

app.post("/api/email-address", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const user = req.user;
  const { email } = req.body;

  try {
    const existingEmailInUser = await User.findOne({ email }).lean().exec();
    const existingEmailInEmailAddress = await EmailAddress.findOne({ email }).lean().exec();

    if (existingEmailInUser || existingEmailInEmailAddress) return res.status(400).json({ success: false, message: "Email already exists, Please try different email" });

    const newEmailAddress = await EmailAddress.create({ email, user: user._id });

    const emailData = {
      recieverEmail: newEmailAddress.email,
      subject: `Verify Your Email on ${process.env.APP_NAME}`,
      emailTemplatePath: VERIFICATION0_MAIL_FOR_OTHER_EMAIL,
      templateData: {
        appName: process.env.APP_NAME,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationLink: `${process.env.FRONTEND_LOCAL_URL}/verify-others-email?email=${newEmailAddress.email}&id=${newEmailAddress.user}`
      }
    }
    sendMail(emailData);

    res.status(201).json({ success: true, message: "Email added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message, stack: error.stack });
  }
});

app.get("/api/email-address", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const user = req.user;
  try {
    const emailAddresses = await EmailAddress.find({ user: user._id }).sort({ isPrimary: -1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, message: "Email addresses fetched successfully", emailAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

app.put("/api/email-address/:emailId", authenticate, authorize(["carrier", "shipper"]), async (req, res) => {
  const user = req.user;
  const { emailId } = req.params;
  try {
    const emailAddress = await EmailAddress.findOne({ _id: emailId, user: user._id }).lean();
    if (!emailAddress) return res.status(404).json({ success: false, message: "Email not found" });
    if (!emailAddress.isVerified) return res.status(404).json({ success: false, message: "Email not verified yet" });

    await EmailAddress.updateMany(
      { user: user._id },
      { $set: { isPrimary: false } }
    );

    const updatedEmail = await EmailAddress.findByIdAndUpdate(
      emailId,
      { $set: { isPrimary: true } },
      { new: true }
    ).lean();

    res.status(200).json({ success: true, message: "Email set to primary successfully", updatedEmail });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`App is running at http://localhost:${PORT}`));