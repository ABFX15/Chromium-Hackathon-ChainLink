export default function EarningsPage() {
  return (
    <div>
      <div className="text-2xl font-bold text-cyan-400 mb-4">
        Earnings Dashboard
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">💵</span>
          <span className="text-lg font-bold">$70,380</span>
          <span className="text-xs mt-1">Monthly Revenue</span>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">📈</span>
          <span className="text-lg font-bold">$844,560</span>
          <span className="text-xs mt-1">Annual Projection</span>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">👥</span>
          <span className="text-lg font-bold">161</span>
          <span className="text-xs mt-1">Active Earners</span>
        </div>
      </div>
      <div className="card p-6">
        <div className="font-bold text-cyan-300 mb-4">
          Revenue Stream Breakdown
        </div>
        <div className="mb-4">
          <div className="text-cyan-200 font-bold">Lender Interest Income</div>
          <div className="text-xs text-cyan-400 mb-2">
            Interest earned on active loans
          </div>
          <div className="text-green-400 font-bold">$45,670/month</div>
          <div className="text-xs text-cyan-400">127 active lenders</div>
        </div>
        <div>
          <div className="text-cyan-200 font-bold">
            Protocol Origination Fees
          </div>
          <div className="text-xs text-cyan-400 mb-2">
            1% fee on new loans created
          </div>
          <div className="text-blue-400 font-bold">$12,340/month</div>
          <div className="text-xs text-cyan-400">89 loans originated</div>
        </div>
      </div>
    </div>
  );
}
