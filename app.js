import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Database connected!")
}).catch((err) => {
  console.log(err);
  process.exit(1);
})

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`App is running at http://localhost:${PORT}`));