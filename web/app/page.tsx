import Link from "next/link";

const features = [
  {
    title: "Select Customer",
    description: "Choose a customer profile to act on their behalf for placing orders and viewing history.",
    href: "/select-customer",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    color: "from-indigo-500 to-indigo-600",
    shadowColor: "shadow-indigo-500/25",
  },
  {
    title: "Dashboard",
    description: "View a high-level overview of orders, fulfillment status, and key pipeline metrics.",
    href: "/dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
      </svg>
    ),
    color: "from-emerald-500 to-emerald-600",
    shadowColor: "shadow-emerald-500/25",
  },
  {
    title: "Place Order",
    description: "Create new orders with product selection, quantities, and shipping details.",
    href: "/place-order",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    ),
    color: "from-amber-500 to-orange-500",
    shadowColor: "shadow-amber-500/25",
  },
  {
    title: "Order History",
    description: "Browse past orders with status tracking, filtering, and detailed shipment information.",
    href: "/orders",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    color: "from-sky-500 to-blue-500",
    shadowColor: "shadow-sky-500/25",
  },
  {
    title: "Priority Queue",
    description: "View the warehouse fulfillment queue ranked by ML-predicted fraud risk scores.",
    href: "/warehouse/priority",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
    color: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/25",
  },
  {
    title: "Run Scoring",
    description: "Trigger the ML inference pipeline to score unfulfilled orders and update predictions.",
    href: "/scoring",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    color: "from-rose-500 to-pink-600",
    shadowColor: "shadow-rose-500/25",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full text-center pt-12 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          <span className="text-sm font-medium text-indigo-700">
            ML Pipeline Active
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Chapter 17{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Web Application
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed">
          A fullstack ML pipeline for order management, fraud detection scoring,
          and warehouse priority fulfillment — powered by machine learning inference.
        </p>
      </section>

      {/* Feature Cards Grid */}
      <section className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={`group relative flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.shadowColor}`}
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-sm`}
            >
              {feature.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
            <div className="flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Get started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </Link>
        ))}
      </section>

      {/* Pipeline Info */}
      <section className="w-full max-w-5xl pb-16">
        <div className="rounded-2xl bg-gray-900 text-white p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/20 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">How the Pipeline Works</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Orders are placed through the app and stored in Supabase. The ML scoring
                engine analyzes unfulfilled orders for fraud risk, then the warehouse
                priority queue ranks them so legitimate orders ship first. Select a
                customer, place an order, run scoring, and watch the queue update in real time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
