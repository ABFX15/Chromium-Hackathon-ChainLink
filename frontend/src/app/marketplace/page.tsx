export default function MarketplacePage() {
  return (
    <div>
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">💰</span>
          <span className="text-lg font-bold">$2,600,000</span>
          <span className="text-xs mt-1">Total Portfolio Value</span>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">📄</span>
          <span className="text-lg font-bold">1</span>
          <span className="text-xs mt-1">Active Loans</span>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">$</span>
          <span className="text-lg font-bold">$350,000</span>
          <span className="text-xs mt-1">Total Borrowed</span>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">📈</span>
          <span className="text-lg font-bold">47.9%</span>
          <span className="text-xs mt-1">Average APR</span>
        </div>
      </div>
      {/* Section Title & Description */}
      <div className="text-center mb-8">
        <div className="text-2xl font-bold text-cyan-400 flex items-center justify-center gap-2">
          <span>🖼️</span> RWA NFT Marketplace
        </div>
        <p className="mt-2 text-cyan-200 text-sm max-w-2xl mx-auto">
          Discover premium real estate NFTs available for purchase or collateral
          loans. Browse properties, analyze AI risk scores, and secure financing
          with our advanced lending platform.
        </p>
      </div>
      {/* Search/Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        <input className="w-64" placeholder="Search properties by name..." />
        <select className="w-48">
          <option>Newest First</option>
          <option>Oldest First</option>
        </select>
        <select className="w-48">
          <option>All Properties</option>
          <option>Available</option>
          <option>Collateralized</option>
        </select>
      </div>
      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 flex flex-col items-center">
            <img
              src={`https://source.unsplash.com/400x300/?house,property,${i}`}
              alt="Property"
              className="rounded mb-4 w-full h-40 object-cover"
            />
            <div className="font-bold text-cyan-200 mb-1">Property #{i}</div>
            <div className="text-xs text-cyan-400 mb-2">$500,000</div>
            <div className="flex gap-2 text-xs">
              <span className="bg-cyan-900/30 px-2 py-1 rounded">
                REAL ESTATE
              </span>
              <span className="bg-cyan-900/30 px-2 py-1 rounded">COMMON</span>
            </div>
            <button className="mt-4 w-full bg-cyan-700 hover:bg-cyan-600 text-black font-bold py-2 rounded transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
      <div className="text-center text-xs text-cyan-400 mt-8">
        4 Properties Found
      </div>
    </div>
  );
}
