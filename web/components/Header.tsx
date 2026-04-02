import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Header() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get("selected_customer_id")?.value;
  
  let selectedCustomerName = null;
  
  if (customerIdStr) {
    try {
      const customerId = parseInt(customerIdStr, 10);
      if (!isNaN(customerId)) {
        const result = await db.select().from(customers).where(eq(customers.customer_id, customerId)).limit(1);
        if (result.length > 0) {
          selectedCustomerName = `${result[0].first_name} ${result[0].last_name}`;
        }
      }
    } catch(err) {
      console.error("DB error getting active customer", err);
    }
  }

  return (
    <header className="bg-gray-900 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl text-indigo-400">Chapter 17 WebApp</Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/select-customer" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Select Customer</Link>
              <Link href="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <Link href="/place-order" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Place Order</Link>
              <Link href="/orders" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Order History</Link>
              <Link href="/warehouse/priority" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Priority Queue</Link>
              <Link href="/scoring" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Run Scoring</Link>
            </div>
          </div>
          <div>
            {selectedCustomerName ? (
              <span className="text-sm px-3 py-1 bg-indigo-600 rounded-full">
                Acting as: <strong>{selectedCustomerName}</strong>
              </span>
            ) : (
              <span className="text-sm text-gray-400">No customer selected</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
