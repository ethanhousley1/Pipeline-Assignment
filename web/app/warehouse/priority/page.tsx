import { db } from "@/db";
import { orders, customers, order_predictions } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export default async function PriorityQueuePage() {
  let priorities = [];
  try {
    priorities = await db.select({
      orderId: orders.order_id,
      orderTimestamp: orders.order_timestamp,
      totalValue: orders.total_value,
      fulfilled: orders.fulfilled,
      customerId: customers.customer_id,
      customerName: customers.first_name, // we will concat with last name below
      customerLastName: customers.last_name,
      probability: order_predictions.late_delivery_probability,
      predictedLate: order_predictions.predicted_late_delivery,
      predictionTime: order_predictions.prediction_timestamp
    })
    .from(orders)
    .innerJoin(customers, eq(customers.customer_id, orders.customer_id))
    .innerJoin(order_predictions, eq(order_predictions.order_id, orders.order_id))
    .where(eq(orders.fulfilled, 0))
    .orderBy(
      desc(order_predictions.late_delivery_probability),
      asc(orders.order_timestamp)
    )
    .limit(50);
  } catch(err) {
    console.error("Failed to load priority queue", err);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 shadow rounded">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Late Delivery Priority Queue</h1>
        <p className="text-gray-600">
          Orders with the highest predicted probability of late delivery rise to the top so the warehouse can process them first. This list only shows unfulfilled orders.
        </p>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        {priorities.length === 0 ? (
          <div className="p-6 text-center text-gray-500 border border-t-0">
            Queue is empty. No unfulfilled orders have predictions recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase font-bold">Late Probability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priorities.map(p => (
                  <tr key={p.orderId} className="hover:bg-red-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{p.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(p.orderTimestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                      {p.customerName} {p.customerLastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded inline-flex font-semibold ${p.probability && p.probability > 0.5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {p.probability !== null ? (p.probability * 100).toFixed(1) + '%' : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.predictedLate === 1 ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${Number(p.totalValue).toFixed(2)}
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
