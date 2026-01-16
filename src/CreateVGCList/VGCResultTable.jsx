import { useI18n } from "../contexts/i18n/I18nContext";

export default function VGCResultTable({ data }) {
  const { t } = useI18n();

  if (!data || typeof data !== "object") {
    return <p>{t("common.noData")}</p>;
  }

  const entries = Object.entries(data);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-green-100">
          <tr>
            <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
              {t("common.personnel")}
            </th>
            <th className="border border-gray-300 bg-green-100 text-green-700 text-sm px-4 py-2 text-left">
              {t("common.children")}
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

