import Button from "./Button";

export default function FileItem({
  file,
  onView,
  onDownload,
  onStatus,
  onRemove,
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
        <span
          className="font-mono truncate max-w-[40%] shrink"
          title={file.key}
        >
          {file.key}
        </span>
        {file.path ? (
          <span
            className="text-gray-500 truncate max-w-[60%] shrink"
            title={file.path}
          >
            {file.path}
          </span>
        ) : null}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="xs" icon="eye" onClick={onView} title="View">
        </Button>
        <Button variant="ghost" size="xs" icon="download" onClick={onDownload} title="Download">
        </Button>
        <Button variant="secondary" size="xs" icon="info" onClick={onStatus} title="Status">
        </Button>
        <Button variant="secondary" size="xs" icon="trash-2" onClick={onRemove} title="Remove">
        </Button>
      </div>
    </div>
  );
}
