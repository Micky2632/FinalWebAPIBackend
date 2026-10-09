import express from "express";
import { conn } from "../../dbconnect";
export const router = express.Router();
router.get("/", async (_q, res) => {
  try {
    const [r] = await conn.query("SELECT * FROM ORDERS ORDER BY id DESC");
    res.json(r);
  } catch (error: any) {
    console.error("Order query failed:", error);
    res.status(500).json({ error: error?.message || "Database error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const [r] = await conn.query(
      "INSERT INTO ORDERS(customer_id,box_count,status,is_demo) VALUES(?,?,?,?)",
      [req.body.customer_id, req.body.box_count, "ready", false],
    );
    res.status(201).json({ last_id: (r as any).insertId });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ error: "Please provide valid latitude and longitude" });
    const [rows] = await conn.query(`SELECT o.*, c.first_name, c.last_name, c.phone, c.address, c.latitude, c.longitude FROM ORDERS o JOIN CUSTOMERS c ON c.id=o.customer_id`);
    const nearby = (rows as any[]).map((order) => {
      const dLat = ((Number(order.latitude) - latitude) * Math.PI) / 180;
      const dLon = ((Number(order.longitude) - longitude) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(latitude * Math.PI / 180) * Math.cos(Number(order.latitude) * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...order, distance_km: Number(distance.toFixed(3)) };
    }).filter((order) => order.distance_km <= 2).sort((a, b) => a.distance_km - b.distance_km);
    res.json(nearby);
  } catch { res.status(500).json({ error: "Database error" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { customer_id, box_count, status } = req.body;
    const [result] = await conn.query("UPDATE ORDERS SET customer_id=COALESCE(?,customer_id), box_count=COALESCE(?,box_count), status=COALESCE(?,status) WHERE id=?", [customer_id ?? null, box_count ?? null, status ?? null, req.params.id]);
    if (!(result as any).affectedRows) return res.status(404).json({ error: "Order not found" });
    res.json({ affected_rows: (result as any).affectedRows });
  } catch { res.status(500).json({ error: "Database error" }); }
});

router.delete("/demo", async (_req, res) => {
  try { const [result] = await conn.query("DELETE FROM ORDERS WHERE is_demo = TRUE"); res.json({ deleted_orders: (result as any).affectedRows }); }
  catch { res.status(500).json({ error: "Database error" }); }
});

router.delete("/:id", async (req, res) => {
  try { const [result] = await conn.query("DELETE FROM ORDERS WHERE id=?", [req.params.id]); if (!(result as any).affectedRows) return res.status(404).json({ error: "Order not found" }); res.json({ affected_rows: (result as any).affectedRows }); }
  catch { res.status(500).json({ error: "Database error" }); }
});

router.post("/random", async (req, res) => {
  try {
    const amount = Number(req.body.amount ?? 20);
    if (!Number.isInteger(amount) || amount < 20 || amount > 30) return res.status(400).json({ error: "amount must be between 20 and 30" });
    const [customers] = await conn.query("SELECT id FROM CUSTOMERS");
    if (!(customers as any[]).length) return res.status(400).json({ error: "No customers available" });
    const values = Array.from({ length: amount }, () => { const customer = (customers as any[])[Math.floor(Math.random() * (customers as any[]).length)]; return [customer.id, Math.floor(Math.random() * 3) + 1, "pending", true]; });
    const placeholders = values.map(() => "(?,?,?,?)").join(",");
    const [result] = await conn.query(`INSERT INTO ORDERS (customer_id,box_count,status,is_demo) VALUES ${placeholders}`, values.flat());
    res.status(201).json({ message: "Random orders generated", amount, first_id: (result as any).insertId });
  } catch { res.status(500).json({ error: "Database error" }); }
});
