export default function PortfolioPage() {
  return (
    <div>
      <div className="text-2xl font-bold text-cyan-400 mb-4">
        Property Portfolio
      </div>
      <div className="text-cyan-200 text-xs mb-6">
        4 property nfts in wallet
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 flex flex-col items-center">
            <img
              src={`https://source.unsplash.com/400x300/?house,property,${i}`}
              alt="Property"
              className="rounded mb-4 w-full h-40 object-cover"
            />
            <div className="font-bold text-cyan-200 mb-1">
              Waterfront Villa #{i}
            </div>
            <div className="text-xs text-cyan-400 mb-2">$500,000</div>
            <div className="flex gap-2 text-xs">
              <span className="bg-cyan-900/30 px-2 py-1 rounded">
                REAL ESTATE
              </span>
              <span className="bg-cyan-900/30 px-2 py-1 rounded">COMMON</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button className="bg-cyan-700 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded transition-colors">
          Mint Property NFT
        </button>
      </div>
    </div>
  );
}
