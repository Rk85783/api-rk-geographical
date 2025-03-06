import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Database connected!")
}).catch((err) => {
  console.log(err);
  process.exit(1);
})

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

// -----> Carriers
app.get("/api/truck-types", async (req, res) => {
  try {
    const { page = 1, limit = 100, sort = 'id', order = 'asc', ...filters } = req.query;
    const sortOrder = order === 'asc' ? 1 : -1;

    const filterConditions = {};
    for (const [key, value] of Object.entries(filters)) {
      filterConditions[key] = new RegExp(value, 'i');
    }

    const [totalCount, data] = await Promise.all([
      mongoose.connection.db.collection("truckTypes").countDocuments(filterConditions),
      mongoose.connection.db.collection("truckTypes").find(filterConditions)
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`App is running at http://localhost:${PORT}`));