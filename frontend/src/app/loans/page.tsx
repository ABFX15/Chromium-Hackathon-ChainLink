export default function LoansPage() {
  return (
    <div>
      <div className="text-2xl font-bold text-cyan-400 mb-4">My Loans</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      <div className="card p-6">
        <div className="font-bold text-cyan-300 mb-4">Active Loans</div>
        <table className="w-full text-cyan-200 text-xs">
          <thead>
            <tr className="border-b border-cyan-700">
              <th className="py-2">Loan ID</th>
              <th>Property</th>
              <th>Debt</th>
              <th>APR</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[1].map((i) => (
              <tr key={i} className="border-b border-cyan-900">
                <td className="py-2">#{i}</td>
                <td>Waterfront Villa #{i}</td>
                <td>$350,000</td>
                <td>47.9%</td>
                <td>
                  <span className="bg-cyan-900/30 px-2 py-1 rounded">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
