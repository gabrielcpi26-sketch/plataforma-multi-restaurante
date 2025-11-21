// server/index.js
// Servidor para Stripe Checkout

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items = [], currency = "mxn", success_url, cancel_url, restaurant = "rest" } = req.body || {};

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe no configurado. Define STRIPE_SECRET_KEY en .env" });
    }

    const line_items = items.map(it => ({
      price_data: {
        currency,
        product_data: { name: `${restaurant} · ${it.name}` },
        unit_amount: it.unit_amount,
      },
      quantity: it.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: success_url || "http://localhost:5173/#/success",
      cancel_url: cancel_url || "http://localhost:5173",
    });

    res.json({ id: session.id, url: session.url });
  } catch (e) {
    console.error("Stripe error", e);
    res.status(500).send(String(e));
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Stripe backend listo en http://localhost:${PORT}`));
