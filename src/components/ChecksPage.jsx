import { useMemo, useState } from "react";
import {
  FileKind,
  uploadFile,
  getFileStatus,
  getFileDownloadUrl,
  getFileViewUrl,
  removeFile,
  startCheck,
  getCheckProgress,
} from "../services/api";

function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
}

function UploadSection({ title, kind, files, onUploaded, onRemoved }) {
  const [isUploading, setIsUploading] = useState(false);

  async function handlePickAndUpload() {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept =
        kind === FileKind.VGC_LIST
          ? "application/json"
          : "image/*,application/pdf";
      input.onchange = async () => {
        if (input.files && input.files[0]) {
          setIsUploading(true);
          try {
            const result = await uploadFile(input.files[0], kind);
            onUploaded(kind, result);
          } finally {
            setIsUploading(false);
          }
        }
      };
      input.click();
    } catch (e) {
      console.error(e);
      alert(e.message || "Upload failed");
    }
  }

  async function handleCheckStatus(fileKey) {
    try {
      const res = await getFileStatus(fileKey);
      alert(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to get file status");
    }
  }

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>{title}</strong>
        <button onClick={handlePickAndUpload} disabled={isUploading}>
          {isUploading ? "Uploading…" : "Upload"}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {files.length === 0 && (
          <span style={{ color: "#6b7280" }}>No files uploaded yet.</span>
        )}
        {files.map((f) => (
          <div
            key={f.key}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <span style={{ fontFamily: "monospace" }}>{f.key}</span>
              {f.path ? (
                <span
                  style={{
                    color: "#6b7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {f.path}
                </span>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <a href={getFileViewUrl(f.key)} target="_blank" rel="noreferrer">
                View
              </a>
              <a
                href={getFileDownloadUrl(f.path)}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
              <button onClick={() => handleCheckStatus(f.key)}>Status</button>
              <button
                onClick={async () => {
                  await removeFile(f.key);
                  onRemoved(kind, f.key);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChecksPage() {
  const [enableBkr, setEnableBkr] = useState(false);
  const [enableVgc, setEnableVgc] = useState(false);
  const [enableThreeHours, setEnableThreeHours] = useState(false);

  const [fileMap, setFileMap] = useState({
    [FileKind.STAFF_PLANNING]: [],
    [FileKind.CHILD_PLANNING]: [],
    [FileKind.CHILD_REGISTRATION]: [],
    [FileKind.VGC_LIST]: [],
  });

  const requiredVisibleKinds = useMemo(() => {
    const kinds = new Set([FileKind.STAFF_PLANNING, FileKind.CHILD_PLANNING]);
    if (enableVgc) kinds.add(FileKind.VGC_LIST);
    if (enableThreeHours) kinds.add(FileKind.CHILD_REGISTRATION);
    return Array.from(kinds);
  }, [enableVgc, enableThreeHours]);

  function handleUploaded(kind, res) {
    const item = {
      key: res.objectKey,
      path: res.fileUrl,
      status: true,
    };
    setFileMap((prev) => ({
      ...prev,
      [kind]: [...(prev[kind] || []), item],
    }));
  }

  function handleRemoved(kind, key) {
    setFileMap((prev) => ({
      ...prev,
      [kind]: (prev[kind] || []).filter((f) => f.key !== key),
    }));
  }

  const [isStartingCheck, setIsStartingCheck] = useState(false);
  const [lastCheckId, setLastCheckId] = useState("");
  const [progressCheckId, setProgressCheckId] = useState("");
  const [progressResult, setProgressResult] = useState(null);

  const hasRequiredFiles =
    (fileMap[FileKind.STAFF_PLANNING]?.length || 0) > 0 &&
    (fileMap[FileKind.CHILD_PLANNING]?.length || 0) > 0;

  async function handleStartCheck() {
    if (!hasRequiredFiles) {
      alert("Please upload staff-planning and child-planning first.");
      return;
    }
    const modules = [];
    if (enableBkr) modules.push("bkr");
    if (enableVgc) modules.push("vgc");
    if (enableThreeHours) modules.push("three_hours");

    // Additional validation per selected module
    if (enableVgc && (fileMap[FileKind.VGC_LIST]?.length || 0) === 0) {
      alert("Please upload VGC list (JSON) to run VGC.");
      return;
    }
    if (enableThreeHours && (fileMap[FileKind.CHILD_REGISTRATION]?.length || 0) === 0) {
      alert("Please upload child-registration to run 3-UURs.");
      return;
    }

    // Collect document keys from uploaded files relevant to selected modules
    const documentKeys = [
      ...(fileMap[FileKind.STAFF_PLANNING] || []).map((f) => f.key),
      ...(fileMap[FileKind.CHILD_PLANNING] || []).map((f) => f.key),
      ...(enableVgc ? (fileMap[FileKind.VGC_LIST] || []).map((f) => f.key) : []),
      ...(enableThreeHours ? (fileMap[FileKind.CHILD_REGISTRATION] || []).map((f) => f.key) : []),
    ];

    const source = "flexkids";
    const date = new Date().toISOString().slice(0, 10);
    try {
      setIsStartingCheck(true);
      const res = await startCheck({
        date,
        modules,
        documentKeys,
        source,
      });
      const checkId = res.id || res.checkId || String(res);
      setLastCheckId(checkId);
      setProgressCheckId(checkId);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to start check");
    } finally {
      setIsStartingCheck(false);
    }
  }

  async function handleGetProgress() {
    if (!progressCheckId) {
      alert("Please enter a check id.");
      return;
    }
    try {
      setProgressResult("Loading…");
      const res = await getCheckProgress(progressCheckId);
      setProgressResult(res);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to get progress");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <h2>BKR / VGC / 3-UURs Checks</h2>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Checkbox
          label="BKR"
          checked={enableBkr}
          onChange={() => setEnableBkr((v) => !v)}
        />
        <Checkbox
          label="VGC"
          checked={enableVgc}
          onChange={() => setEnableVgc((v) => !v)}
        />
        <Checkbox
          label="3-UURs"
          checked={enableThreeHours}
          onChange={() => setEnableThreeHours((v) => !v)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {requiredVisibleKinds.includes(FileKind.STAFF_PLANNING) && (
          <UploadSection
            title="Upload Staff-Planning"
            kind={FileKind.STAFF_PLANNING}
            files={fileMap[FileKind.STAFF_PLANNING]}
            onUploaded={handleUploaded}
            onRemoved={handleRemoved}
          />
        )}
        {requiredVisibleKinds.includes(FileKind.CHILD_PLANNING) && (
          <UploadSection
            title="Upload Child-Planning"
            kind={FileKind.CHILD_PLANNING}
            files={fileMap[FileKind.CHILD_PLANNING]}
            onUploaded={handleUploaded}
            onRemoved={handleRemoved}
          />
        )}
        {enableVgc && (
          <UploadSection
            title="Upload VGC List (JSON)"
            kind={FileKind.VGC_LIST}
            files={fileMap[FileKind.VGC_LIST]}
            onUploaded={handleUploaded}
            onRemoved={handleRemoved}
          />
        )}
        {enableThreeHours && (
          <UploadSection
            title="Upload Child-Registration"
            kind={FileKind.CHILD_REGISTRATION}
            files={fileMap[FileKind.CHILD_REGISTRATION]}
            onUploaded={handleUploaded}
            onRemoved={handleRemoved}
          />
        )}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={handleStartCheck}
          disabled={!hasRequiredFiles || isStartingCheck}
        >
          {isStartingCheck ? "Starting…" : "Start Check"}
        </button>
        {lastCheckId && (
          <span style={{ color: "#6b7280" }}>
            Last Check ID: <strong>{lastCheckId}</strong>
          </span>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <strong>Check Progress</strong>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            value={progressCheckId}
            onChange={(e) => setProgressCheckId(e.target.value)}
            placeholder="Enter check id"
            style={{ padding: 6, border: "1px solid #d1d5db", borderRadius: 6 }}
          />
          <button onClick={handleGetProgress}>Get Progress</button>
        </div>
        {progressResult && (
          <pre
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              padding: 12,
              borderRadius: 6,
              maxHeight: 320,
              overflow: "auto",
            }}
          >
            {typeof progressResult === "string"
              ? progressResult
              : JSON.stringify(progressResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
