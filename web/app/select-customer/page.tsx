import { db } from "@/db";
import { customers } from "@/db/schema";
import { selectCustomerAction } from "@/app/actions";

export default async function SelectCustomerPage() {
  let allCustomers = [];
  try {
    allCustomers = await db.select().from(customers).limit(100);
  } catch (err) {
    console.error("DB error fetching customers", err);
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Select a Customer</h1>
      {allCustomers.length === 0 ? (
        <div className="text-red-500 bg-red-50 p-4 rounded border border-red-200">
          No customers found in database. Please seed the database first or check connection.
        </div>
      ) : (
        <form action={selectCustomerAction} className="space-y-4">
          <div>
            <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <select
              id="customer_id"
              name="customer_id"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
            >
              <option value="" disabled selected>
                Select a customer...
              </option>
              {allCustomers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.first_name} {c.last_name} ({c.email})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Act As Selected Customer
          </button>
        </form>
      )}
    </div>
  );
}
