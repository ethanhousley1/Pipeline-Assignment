import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { eq, desc, sum, count } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get("selected_customer_id")?.value;

  if (!customerIdStr) {
    redirect("/select-customer");
  }

  const customerId = parseInt(customerIdStr, 10);
  if (isNaN(customerId)) {
    redirect("/select-customer");
  }

  // Fetch customer details
  const customerResult = await db.select().from(customers).where(eq(customers.customer_id, customerId)).limit(1);
  if (customerResult.length === 0) {
    redirect("/select-customer");
  }
  const customer = customerResult[0];

  // Fetch summary stats
  const statsResult = await db.select({
    totalOrders: count(orders.order_id),
    totalSpend: sum(orders.total_value),
  }).from(orders).where(eq(orders.customer_id, customerId));

  const stats = statsResult[0] ? {
    totalOrders: Number(statsResult[0].totalOrders) || 0,
    totalSpend: Number(statsResult[0].totalSpend) || 0
  } : { totalOrders: 0, totalSpend: 0 };

  // Fetch recent 5 orders
  const recentOrders = await db.select()
    .from(orders)
    .where(eq(orders.customer_id, customerId))
    .orderBy(desc(orders.order_timestamp))
    .limit(5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow rounded p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Dashboard</h1>
        <p className="text-gray-600">
          Showing summary for: <strong className="text-gray-800">{customer.first_name} {customer.last_name}</strong> ({customer.email})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-medium text-gray-500">Total Orders</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-medium text-gray-500">Lifetime Spend</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600">${stats.totalSpend.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">5 Most Recent Orders</h2>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((o) => (
                  <tr key={o.order_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{o.order_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(o.order_timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${Number(o.total_value).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {o.fulfilled ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Fulfilled</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:underline">
                      <Link href={`/orders/${o.order_id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent orders found.</p>
        )}
        <div className="mt-4">
           <Link href="/orders" className="text-indigo-600 hover:text-indigo-900 font-medium">View All Order History &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
