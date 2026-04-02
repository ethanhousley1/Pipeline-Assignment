"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { orders, order_items, products } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";

export async function placeOrderAction(cart: { productId: number; quantity: number }[]) {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get("selected_customer_id")?.value;

  if (!customerIdStr || cart.length === 0) {
    return { error: "Invalid customer or empty cart." };
  }

  const customerId = parseInt(customerIdStr, 10);

  try {
    // Start transaction
    await db.transaction(async (tx) => {
      // 1. Fetch product prices and weights
      const productIds = cart.map(item => item.productId);
      const productData = await tx.select().from(products).where(inArray(products.product_id, productIds));
      
      const productMap = new Map();
      for (const p of productData) {
        productMap.set(p.product_id, p);
      }

      let totalValue = 0;
      let totalWeight = 0;
      let numItems = 0;

      const orderItemsInsert = cart.map(item => {
        const prod = productMap.get(item.productId);
        if (!prod) throw new Error("Product not found");
        
        const lineTotal = prod.price * item.quantity;
        totalValue += lineTotal;
        totalWeight += (prod.weight || 0) * item.quantity;
        numItems += item.quantity;

        return {
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: prod.price,
          line_total: lineTotal,
        };
      });

      const avgWeight = numItems > 0 ? totalWeight / numItems : 0;

      // 2. Create the order
      const [newOrder] = await tx.insert(orders).values({
        customer_id: customerId,
        fulfilled: 0,
        num_items: numItems,
        total_value: totalValue,
        avg_weight: avgWeight,
      }).returning({ order_id: orders.order_id });

      // 3. Insert order items
      await tx.insert(order_items).values(
        orderItemsInsert.map(item => ({
          ...item,
          order_id: newOrder.order_id,
        }))
      );
    });

    return { success: true };
  } catch (error: any) {
    console.error("Order Transaction Failed", error);
    return { error: error.message || "Could not place order." };
  }
}
