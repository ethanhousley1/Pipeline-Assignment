import { pgTable, serial, integer, text, timestamp, real, numeric } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  customer_id: serial("customer_id").primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  birthdate: timestamp("birthdate", { mode: 'string' }), // or date
  gender: text("gender")
});

export const products = pgTable("products", {
  product_id: serial("product_id").primaryKey(),
  product_name: text("product_name").notNull(),
  price: real("price").notNull(),
  weight: real("weight"),
});

export const orders = pgTable("orders", {
  order_id: serial("order_id").primaryKey(),
  customer_id: integer("customer_id").references(() => customers.customer_id).notNull(),
  order_timestamp: timestamp("order_timestamp", { mode: "string" }).defaultNow().notNull(),
  fulfilled: integer("fulfilled").default(0).notNull(),
  num_items: integer("num_items"),
  total_value: real("total_value"),
  avg_weight: real("avg_weight"),
  late_delivery: integer("late_delivery"), // 0 or 1
  is_fraud: integer("is_fraud").default(0) // based on practice chapter
});

export const order_items = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.order_id).notNull(),
  product_id: integer("product_id").references(() => products.product_id).notNull(),
  quantity: integer("quantity").notNull(),
  unit_price: real("unit_price").notNull(),
  line_total: real("line_total").notNull(),
});

export const order_predictions = pgTable("order_predictions", {
  order_id: integer("order_id").primaryKey().references(() => orders.order_id),
  late_delivery_probability: real("late_delivery_probability"),
  predicted_late_delivery: integer("predicted_late_delivery"),
  prediction_timestamp: timestamp("prediction_timestamp", { mode: "string" }),
});

export const shipments = pgTable("shipments", {
  shipment_id: serial("shipment_id").primaryKey(),
  order_id: integer("order_id").references(() => orders.order_id).notNull(),
  carrier: text("carrier"),
  shipping_method: text("shipping_method"),
  distance_band: text("distance_band"),
  promised_days: real("promised_days"),
  actual_days: real("actual_days"),
  late_delivery: integer("late_delivery")
});
