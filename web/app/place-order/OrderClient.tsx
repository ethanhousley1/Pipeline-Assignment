"use client";

import { useState } from "react";
import { placeOrderAction } from "./actions";

export default function OrderClient({ availableProducts }: { availableProducts: any[] }) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuantity = (productId: number, qty: number) => {
    setQuantities(prev => {
      const copy = { ...prev };
      if (qty <= 0) delete copy[productId];
      else copy[productId] = qty;
      return copy;
    });
  };

  const totalCost = availableProducts.reduce((acc, p) => {
    return acc + (p.price * (quantities[p.product_id] || 0));
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cart = Object.entries(quantities).map(([productId, quantity]) => ({
      productId: Number(productId),
      quantity
    }));

    if (cart.length === 0) {
      setError("Please add at least one product to the order.");
      setLoading(false);
      return;
    }

    // Call server action
    try {
      const result = await placeOrderAction(cart);
      if (result && result.error) {
        setError(result.error);
      } else {
        // Success -> Redirect to /orders
        window.location.href = "/orders";
      }
    } catch(err: any) {
      setError(err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow rounded">
      {error && <div className="mb-4 bg-red-50 text-red-700 p-4 border border-red-200 rounded">{error}</div>}
      
      {availableProducts.length === 0 ? (
        <div className="text-gray-500 italic">No products available in the database to purchase.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <ul className="divide-y divide-gray-200">
            {availableProducts.map(p => (
              <li key={p.product_id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{p.product_name}</h3>
                  <p className="text-sm text-gray-500">${p.price.toFixed(2)} - Weight: {p.weight} kg</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label htmlFor={`qty-${p.product_id}`} className="text-sm text-gray-700 font-medium">Qty:</label>
                  <input
                    type="number"
                    id={`qty-${p.product_id}`}
                    min="0"
                    placeholder="0"
                    value={quantities[p.product_id] || ""}
                    onChange={(e) => handleQuantity(p.product_id, parseInt(e.target.value) || 0)}
                    className="w-20 pl-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </li>
            ))}
          </ul>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-xl text-gray-900 font-bold">Total: ${totalCost.toFixed(2)}</span>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 md:min-w-64 py-3 rounded text-white font-medium bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            >
              {loading ? "Processing..." : "Submit Order"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
