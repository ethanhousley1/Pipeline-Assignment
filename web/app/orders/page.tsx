import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrderHistoryPage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get("selected_customer_id")?.value;

  if (!customerIdStr) {
    redirect("/select-customer");
  }

  const customerId = parseInt(customerIdStr, 10);

  const myOrders = await db.select()
    .from(orders)
    .where(eq(orders.customer_id, customerId))
    .orderBy(desc(orders.order_timestamp));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white shadow p-6 rounded flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <Link href="/place-order" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Place New Order
        </Link>
      </div>

      <div className="bg-white shadow rounded p-0 overflow-hidden">
        {myOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">You have no orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myOrders.map(o => (
                  <tr key={o.order_id} className="hover:bg-gray-50 focus-within:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-l-4 border-transparent hover:border-indigo-500">
                      <Link href={`/orders/${o.order_id}`} className="block">#{o.order_id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(o.order_timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {o.num_items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                      ${Number(o.total_value).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {o.fulfilled ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Fulfilled</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/orders/${o.order_id}`} className="text-indigo-600 hover:underline">View details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
