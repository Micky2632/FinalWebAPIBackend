import express from "express";
import { conn } from "../../dbconnect";
export const router = express.Router();
router.get("/latest", async (_q, res) => {
  try {
    const [r] = await conn.query(
      "SELECT * FROM ROUTING_RUNS ORDER BY id DESC LIMIT 1",
    );
    res.json({ active_plan: (r as any[])[0] || null });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});
