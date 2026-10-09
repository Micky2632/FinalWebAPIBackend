import express from "express";
import { conn } from "../../dbconnect";
export const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const k = String(req.query.name || "");
    const [r] = await conn.query(
      "SELECT * FROM CUSTOMERS WHERE first_name LIKE ? OR last_name LIKE ?",
      [`%${k}%`, `%${k}%`],
    );
    res.json(r);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ error: "Please provide valid latitude and longitude" });
    }
    const [rows] = await conn.query("SELECT * FROM CUSTOMERS");
    const earthRadius = 6371;
    const nearby = (rows as any[]).map((customer) => {
      const dLat = ((Number(customer.latitude) - latitude) * Math.PI) / 180;
      const dLon = ((Number(customer.longitude) - longitude) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(latitude * Math.PI / 180) * Math.cos(Number(customer.latitude) * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      const distance = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...customer, distance_km: Number(distance.toFixed(3)) };
    }).filter((customer) => customer.distance_km <= 1).sort((a, b) => a.distance_km - b.distance_km);
    res.json(nearby);
  } catch { res.status(500).json({ error: "Database error" }); }
});
router.post("/", async (req, res) => {
  try {
    const c = req.body;
    const [r] = await conn.query(
      "INSERT INTO CUSTOMERS(first_name,last_name,phone,address,latitude,longitude) VALUES(?,?,?,?,?,?)",
      [c.first_name, c.last_name, c.phone, c.address, c.latitude, c.longitude],
    );
    res.status(201).json({ last_id: (r as any).insertId });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await conn.query("SELECT * FROM CUSTOMERS WHERE id = ?", [
      req.params.id,
    ]);
    const customers = rows as any[];
    if (customers.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customers[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const c = req.body;
    const [r] = await conn.query(
      "UPDATE CUSTOMERS SET first_name=?,last_name=?,phone=?,address=?,latitude=?,longitude=? WHERE id=?",
      [
        c.first_name,
        c.last_name,
        c.phone,
        c.address,
        c.latitude,
        c.longitude,
        req.params.id,
      ],
    );
    res.json({ affected_rows: (r as any).affectedRows });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const [r] = await conn.query("DELETE FROM CUSTOMERS WHERE id=?", [
      req.params.id,
    ]);
    res.json({ affected_rows: (r as any).affectedRows });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});
