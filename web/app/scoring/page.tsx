"use client";

import { useState } from "react";
import { runScoringAction } from "./actions";

export default function ScoringPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; output?: string } | null>(null);

  const handleRunScoring = async () => {
    setLoading(true);
    setResult(null);
    try {
      const resp = await runScoringAction();
      setResult(resp);
    } catch(err: any) {
      setResult({ success: false, message: "Server action failed", output: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 shadow rounded">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Run Model Scoring</h1>
        <p className="text-gray-600 mb-6">
          Trigger the backend machine learning inference script. The script will generate predictions for unfulfilled orders and update the database, which directly populates the Late Delivery Priority Queue.
        </p>

        <button
          onClick={handleRunScoring}
          disabled={loading}
          className={`px-6 py-3 rounded text-white font-medium bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-indigo-700'}`}
        >
          {loading ? "Running Job..." : "Run Python Inference"}
        </button>
      </div>

      {result && (
        <div className={`p-6 shadow rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h2 className={`text-lg font-bold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? "Job Succeeded" : "Job Failed"}
          </h2>
          <p className="text-sm font-medium text-gray-800 mb-4">{result.message}</p>
          
          {result.output && (
            <div className="mt-4">
              <p className="text-xs uppercase font-bold text-gray-500 mb-2">Console Output:</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                {result.output}
              </pre>
            </div>
          )}
          
          {result.success && (
            <div className="mt-6 flex gap-4">
              <a href="/warehouse/priority" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
                View Updated Priority Queue
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
