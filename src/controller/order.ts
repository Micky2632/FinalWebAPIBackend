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
      "INSERT INTO ORDERS(customer_id,box_count,status) VALUES(?,?,?)",
      [req.body.customer_id, req.body.box_count, "ready"],
    );
    res.status(201).json({ last_id: (r as any).insertId });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});
