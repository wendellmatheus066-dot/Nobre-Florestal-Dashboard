import { useExcel } from "../hooks/useExcel";

export default function DebugExcel() {
  const { data } = useExcel();

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl bg-white shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        Diagnóstico da Planilha
      </h2>

      {Object.entries(data).map(([sheetName, rows]) => (
        <div key={sheetName} className="mb-6 border-b pb-4">

          <h3 className="font-bold text-green-700">
            {sheetName}
          </h3>

          <p>
            Registros: {Array.isArray(rows) ? rows.length : 0}
          </p>

          {Array.isArray(rows) && rows.length > 0 && (
            <>
              <p className="mt-2 font-semibold">
                Colunas:
              </p>

              <ul className="list-disc ml-6">
                {Object.keys(rows[0]).map((column) => (
                  <li key={column}>
                    {column}
                  </li>
                ))}
              </ul>
            </>
          )}

        </div>
      ))}
    </div>
  );
}