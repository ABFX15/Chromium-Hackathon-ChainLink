export default function LiquidationPage() {
  return (
    <div>
      <div className="text-2xl font-bold text-cyan-400 mb-4">
        Liquidation Dashboard
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">🧮</span>
          <span className="text-lg font-bold">3</span>
          <span className="text-xs mt-1">Total Monitored</span>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">⚠️</span>
          <span className="text-lg font-bold">2</span>
          <span className="text-xs mt-1">At Risk</span>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">⚡</span>
          <span className="text-lg font-bold">3</span>
          <span className="text-xs mt-1">Automated</span>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <span className="text-2xl">📉</span>
          <span className="text-lg font-bold">80%</span>
          <span className="text-xs mt-1">Liquidation Threshold</span>
        </div>
      </div>
      <div className="card p-6">
        <div className="font-bold text-cyan-300 mb-4">
          Active Loan Monitoring
        </div>
        <table className="w-full text-cyan-200 text-xs">
          <thead>
            <tr className="border-b border-cyan-700">
              <th className="py-2">Loan ID</th>
              <th>Borrower</th>
              <th>Property Value</th>
              <th>Debt</th>
              <th>LTV</th>
              <th>Health Factor</th>
              <th>Risk Level</th>
              <th>Time to Liquidation</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-cyan-900">
                <td className="py-2">#{i}</td>
                <td>0x742d...E5C2</td>
                <td>$750,000</td>
                <td>$487,500</td>
                <td>65%</td>
                <td>1.23</td>
                <td>
                  <span className="bg-yellow-900/30 px-2 py-1 rounded">
                    Warning
                  </span>
                </td>
                <td>2.3 hours</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
