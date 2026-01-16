export default function VGCResultTable({ data }) {
  if (!data || typeof data !== "object") {
    return <p>Geen data beschikbaar</p>;
  }

  const entries = Object.entries(data);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-green-100">
          <tr>
            <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
              Personeel
            </th>
            <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
              Kinderen
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([person, children], index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-gray-300 px-4 py-2 font-medium">
                {person}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {Array.isArray(children) ? children.join(", ") : children}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

