export default function DashboardHeader({ totals }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm font-semibold text-gray-600">Mensajes recibidos</h3>
        <p className="text-3xl font-bold text-green-600">{totals.recibidos}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm font-semibold text-gray-600">Mensajes enviados</h3>
        <p className="text-3xl font-bold text-pink-600">{totals.enviados}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm font-semibold text-gray-600">Total</h3>
        <p className="text-3xl font-bold text-yellow-600">{totals.total}</p>
      </div>
    </div>
  );
}
