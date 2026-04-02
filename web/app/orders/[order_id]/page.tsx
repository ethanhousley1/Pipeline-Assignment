import { db } from "@/db";
import { orders, order_items, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({ params }: { params: Promise<{ order_id: string }> }) {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get("selected_customer_id")?.value;

  if (!customerIdStr) {
    redirect("/select-customer");
  }

  const { order_id } = await params;
  const orderId = parseInt(order_id, 10);
  if (isNaN(orderId)) {
    notFound();
  }

  // Fetch Order
  const orderResult = await db.select().from(orders).where(eq(orders.order_id, orderId));
  const order = orderResult[0];

  if (!order) {
    notFound();
  }

  // Ensure it's their order
  if (order.customer_id !== parseInt(customerIdStr)) {
    return <div className="max-w-4xl mx-auto p-4 bg-red-50 text-red-500 rounded">Unauthorized</div>;
  }

  // Fetch Line Items
  const items = await db.select({
    orderItemId: order_items.id,
    quantity: order_items.quantity,
    unitPrice: order_items.unit_price,
    lineTotal: order_items.line_total,
    productName: products.product_name,
  })
  .from(order_items)
  .leftJoin(products, eq(order_items.product_id, products.product_id))
  .where(eq(order_items.order_id, orderId));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white shadow p-6 rounded flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Order #{order.order_id}
            {order.fulfilled ? (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Fulfilled</span>
              ) : (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
              )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Placed on: {new Date(order.order_timestamp).toLocaleString()}</p>
        </div>
        <Link href="/orders" className="mt-4 md:mt-0 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 border border-gray-300 rounded">
          &larr; Back to History
        </Link>
      </div>

      <div className="bg-white shadow rounded p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.orderItemId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-l-4 border-transparent">
                    {item.productName || "Unknown Product"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 text-right">
                    ${Number(item.lineTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase">
                  Order Total
                </td>
                <td className="px-6 py-4 text-right text-xl font-bold text-indigo-600 bg-gray-50">
                  ${Number(order.total_value).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
