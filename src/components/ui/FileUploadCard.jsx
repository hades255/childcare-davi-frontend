import { useCallback, useEffect, useState } from "react";
import {
  FileKind,
  getFileDownloadUrl,
  getFileStatus,
  getModuleDocuments,
} from "../../services/api";
import { getKeyFromFileName } from "../../helpers/file";
import Button from "./Button";
import Icon from "./Icon";
import { useChecks } from "../../contexts/ChecksContext";

export default function FileUploadCard({
  kind,
  action,
  children,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOpenButton = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div
      className={`mt-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        {action}
        <Button
          onClick={handleClickOpenButton}
          icon="edit"
          size="sm"
          variant="primary"
        >
          Edit
        </Button>
      </div>

      {children}

      {isOpen && <EditFileDialog kind={kind} onClose={handleCloseDialog} />}
    </div>
  );
}

function EditFileDialog({ kind, onClose }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const module = `bkr${
          kind === FileKind.CHILD_REGISTRATION ? ",threeHours" : ""
        }${kind === FileKind.VGC_LIST ? ",vgc" : ""}`;
        const res = await getModuleDocuments(module);
        setDocuments(res["requiredDocuments"][kind]);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log(error);
        }
      }
    }

    fetchDocuments();

    return () => {};
  }, [kind]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit File</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="space-y-4 h-[40vh] overflow-y-scroll">
          {documents && documents.length > 0 ? (
            documents.map((item) => (
              <DocumentItem key={item} kind={kind} doc={item} />
            ))
          ) : (
            <p>No documentations</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose} variant="secondary" icon="x">
            Cancel
          </Button>
          <Button onClick={onClose} variant="primary" icon="save">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocumentItem({ kind, doc }) {
  const { fileMap, onAdded, onRemoved } = useChecks();

  const files = fileMap[kind];
  const fileKeys = files.map((item) => item.objectKey);

  const docKey = getKeyFromFileName(doc);

  const fileName = doc.split(/[/\\]/).pop().substr(9);

  const handleView = () => {
    window.open(getFileViewUrl(docKey), "_blank");
  };
  const handleDownload = () => {
    window.open(getFileDownloadUrl(`/documents/${kind}/${doc}`), "_blank");
  };
  const handleCheckStatus = async () => {
    try {
      const res = await getFileStatus(docKey);
      alert(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to get file status");
    }
  };
  const handleDelete = async () => {
    await removeFile(docKey);
    onRemoved(kind, docKey);
  };
  const handleAdd = async () => {
    onAdded(kind, { objectKey: docKey, fileUrl: `/documents/${kind}/${doc}` });
  };
  const handleRemove = async () => {
    onRemoved(kind, docKey);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="text-gray-500 truncate max-w-[90%] shrink"
        title={fileName}
      >
        {fileName}
      </span>
      <div className="flex gap-2 shrink-0">
        <Button
          variant="ghost"
          size="xs"
          icon="eye"
          onClick={handleView}
          title="View"
        />
        <Button
          variant="ghost"
          size="xs"
          icon="download"
          onClick={handleDownload}
          title="Download"
        />
        <Button
          variant="secondary"
          size="xs"
          icon="info"
          onClick={handleCheckStatus}
          title="Status"
        />
        <Button
          variant="secondary"
          size="xs"
          icon="trash-2"
          onClick={handleDelete}
          title="Remove"
        />
        {fileKeys.includes(docKey) ? (
          <Button
            variant="secondary"
            size="xs"
            icon="x"
            onClick={handleRemove}
            title="Remvoe from check list"
          />
        ) : (
          <Button
            variant="secondary"
            size="xs"
            icon="check"
            onClick={handleAdd}
            title="Add to check list"
          />
        )}
      </div>
    </div>
  );
}
