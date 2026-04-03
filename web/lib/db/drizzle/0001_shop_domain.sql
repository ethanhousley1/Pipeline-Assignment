CREATE TABLE "customers" (
	"customer_id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"birthdate" timestamp,
	"gender" text,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"product_name" text NOT NULL,
	"price" real NOT NULL,
	"weight" real
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"order_timestamp" timestamp DEFAULT now() NOT NULL,
	"fulfilled" integer DEFAULT 0 NOT NULL,
	"num_items" integer,
	"total_value" real,
	"avg_weight" real,
	"late_delivery" integer,
	"is_fraud" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" real NOT NULL,
	"line_total" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_predictions" (
	"order_id" integer PRIMARY KEY NOT NULL,
	"late_delivery_probability" real,
	"predicted_late_delivery" integer,
	"prediction_timestamp" timestamp
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"shipment_id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"carrier" text,
	"shipping_method" text,
	"distance_band" text,
	"promised_days" real,
	"actual_days" real,
	"late_delivery" integer
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_predictions" ADD CONSTRAINT "order_predictions_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;
