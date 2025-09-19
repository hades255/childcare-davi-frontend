import { useChecks } from "../../contexts/ChecksContext";
import {
  getFileDownloadUrl,
  getFileStatus,
  getFileViewUrl,
} from "../../services/api";
import Button from "./Button";

export default function FileItem({ kind, file }) {
  const { onRemoved } = useChecks();

  const fileName = file.fileUrl.split(/[/\\]/).pop().substr(9);

  function handleView() {
    window.open(getFileViewUrl(file.objectKey), "_blank");
  }
  function handleDownload() {
    window.open(getFileDownloadUrl(file.fileUrl), "_blank");
  }
  async function handleCheckStatus() {
    try {
      const res = await getFileStatus(file.objectKey);
      alert(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to get file status");
    }
  }
  async function handleDelete() {
    await removeFile(file.objectKey);
    onRemoved(kind, file.objectKey);
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
        <span
          className="text-gray-500 truncate max-w-[60%] shrink"
          title={fileName}
        >
          {fileName}
        </span>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="xs"
          icon="eye"
          onClick={handleView}
          title="View"
        ></Button>
        <Button
          variant="ghost"
          size="xs"
          icon="download"
          onClick={handleDownload}
          title="Download"
        ></Button>
        <Button
          variant="secondary"
          size="xs"
          icon="info"
          onClick={handleCheckStatus}
          title="Status"
        ></Button>
        <Button
          variant="secondary"
          size="xs"
          icon="trash-2"
          onClick={handleDelete}
          title="Remove"
        ></Button>
      </div>
    </div>
  );
}
