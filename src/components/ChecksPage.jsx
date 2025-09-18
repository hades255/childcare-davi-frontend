import { memo, useCallback, useMemo, useState } from "react";
import FileUploadCard from "./ui/FileUploadCard";
import Button from "./ui/Button";
import Toggle from "./ui/Toggle";
import FileItem from "./ui/FileItem";
import Icon from "./ui/Icon";
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

const Checkbox = memo(function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  readOnly,
}) {
  return (
    <Toggle
      label={label}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
});

const UploadSection = memo(function UploadSection({
  title,
  kind,
  files,
  onUploaded,
  onRemoved,
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handlePickAndUpload = useCallback(
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
    },
    [kind, onUploaded]
  );

  async function handleCheckStatus(fileKey) {
    try {
      const res = await getFileStatus(fileKey);
      alert(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to get file status");
    }
  }

  function getFileName(filePath) {
    return filePath.split(/[/\\]/).pop().substr(9);
  }

  return (
    <FileUploadCard
      className="min-w-[320px]"
      kind={kind}
      action={
        <Button onClick={handlePickAndUpload} disabled={isUploading} size="sm">
          {isUploading ? "Uploading…" : `Upload ${title}`}
        </Button>
      }
    >
      <div className="flex flex-col gap-1.5">
        {files.length === 0 && (
          <span className="text-gray-500">No files uploaded yet.</span>
        )}
        {files.map((f) => (
          <FileItem
            key={f.key}
            file={{ key: f.key, path: getFileName(f.path || "") }}
            onView={() => window.open(getFileViewUrl(f.key), "_blank")}
            onDownload={() => window.open(getFileDownloadUrl(f.path), "_blank")}
            onStatus={() => handleCheckStatus(f.key)}
            onRemove={async () => {
              await removeFile(f.key);
              onRemoved(kind, f.key);
            }}
          />
        ))}
      </div>
    </FileUploadCard>
  );
});

const uploadSectionItems = [
  { title: "Staff-Planning", kind: FileKind.STAFF_PLANNING },
  { title: "Child-Planning", kind: FileKind.CHILD_PLANNING },
  { title: "VGC List (JSON)", kind: FileKind.CHILD_REGISTRATION },
  { title: "Child-Registration", kind: FileKind.VGC_LIST },
];

export default function ChecksPage() {
  const [enableBkr, setEnableBkr] = useState(true);
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

  const handleUploaded = useCallback(function handleUploaded(kind, res) {
    const item = {
      key: res.objectKey,
      path: res.fileUrl,
      status: true,
    };
    setFileMap((prev) => {
      const existing = prev[kind] || [];
      // Avoid duplicates by key
      if (existing.some((x) => x.key === item.key)) return prev;
      return {
        ...prev,
        [kind]: [...existing, item],
      };
    });
  }, []);

  const handleRemoved = useCallback(function handleRemoved(kind, key) {
    setFileMap((prev) => ({
      ...prev,
      [kind]: (prev[kind] || []).filter((f) => f.key !== key),
    }));
  }, []);

  const handleSubAdd = useCallback(function handleSubAdd(kind, key, filename) {
    setFileMap((prev) => {
      const existing = prev[kind] || [];
      // Avoid duplicates by key
      if (existing.some((x) => x.key === key)) return prev;
      return {
        ...prev,
        [kind]: [
          ...existing,
          {
            key,
            path: `/documents/${kind}/${filename}`,
          },
        ],
      };
    });
  });

  const [isStartingCheck, setIsStartingCheck] = useState(false);
  const [lastCheckId, setLastCheckId] = useState("");
  const [progressCheckId, setProgressCheckId] = useState("");
  const [progressResult, setProgressResult] = useState(null);

  const validation = useMemo(() => {
    const hasStaff = (fileMap[FileKind.STAFF_PLANNING]?.length || 0) > 0;
    const hasChildPlan = (fileMap[FileKind.CHILD_PLANNING]?.length || 0) > 0;
    const hasVgc = (fileMap[FileKind.VGC_LIST]?.length || 0) > 0;
    const hasReg = (fileMap[FileKind.CHILD_REGISTRATION]?.length || 0) > 0;

    const missing = [];
    if (!hasStaff) missing.push("staff-planning");
    if (!hasChildPlan) missing.push("child-planning");
    if (enableVgc && !hasVgc) missing.push("vgc_list");
    if (enableThreeHours && !hasReg) missing.push("child-registration");

    return {
      hasStaff,
      hasChildPlan,
      hasVgc,
      hasReg,
      missing,
      canStart:
        hasStaff &&
        hasChildPlan &&
        (!enableVgc || hasVgc) &&
        (!enableThreeHours || hasReg),
    };
  }, [fileMap, enableVgc, enableThreeHours]);

  async function handleStartCheck() {
    if (!validation.canStart) {
      alert(`Missing required documents: ${validation.missing.join(", ")}`);
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
    if (
      enableThreeHours &&
      (fileMap[FileKind.CHILD_REGISTRATION]?.length || 0) === 0
    ) {
      alert("Please upload child-registration to run 3-UURs.");
      return;
    }

    // Collect document keys from uploaded files relevant to selected modules
    const documentKeys = [
      ...(fileMap[FileKind.STAFF_PLANNING] || []).map((f) => f.key),
      ...(fileMap[FileKind.CHILD_PLANNING] || []).map((f) => f.key),
      ...(enableVgc
        ? (fileMap[FileKind.VGC_LIST] || []).map((f) => f.key)
        : []),
      ...(enableThreeHours
        ? (fileMap[FileKind.CHILD_REGISTRATION] || []).map((f) => f.key)
        : []),
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
    <div className="flex flex-col gap-3 p-4 max-w-[980px] mx-auto">
      <h2 className="text-xl font-semibold">BKR / VGC / 3-UURs Checks</h2>

      <div className="flex gap-4 flex-wrap">
        <Checkbox
          label="BKR"
          checked={enableBkr}
          onChange={() => setEnableBkr((v) => !v)}
          readOnly={true}
          disabled={true}
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

      <div className="grid grid-cols-1">
        {uploadSectionItems.map(
          (item, index) =>
            requiredVisibleKinds.includes(item.kind) && (
              <UploadSection
                key={index}
                title={item.title}
                kind={item.kind}
                files={fileMap[item.kind]}
                onUploaded={handleUploaded}
                onRemoved={handleRemoved}
              />
            )
        )}
      </div>

      <div className="flex gap-2 items-center">
        <Button
          onClick={handleStartCheck}
          disabled={!validation.canStart || isStartingCheck}
          icon={isStartingCheck ? "loader-2" : "play"}
          title={
            !validation.canStart && validation.missing.length
              ? `Missing: ${validation.missing.join(", ")}`
              : undefined
          }
        >
          {isStartingCheck ? "Starting…" : "Start Check"}
        </Button>
        {lastCheckId && (
          <span className="text-gray-500">
            Last Check ID: <strong>{lastCheckId}</strong>
          </span>
        )}
      </div>

      <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
        <strong>Check Progress</strong>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            value={progressCheckId}
            onChange={(e) => setProgressCheckId(e.target.value)}
            placeholder="Enter check id"
            className="px-2 py-1 border border-gray-300 rounded-md"
          />
          <Button
            onClick={handleGetProgress}
            variant="secondary"
            icon="refresh-cw"
          >
            Get Progress
          </Button>
        </div>
        {progressResult && (
          <pre className="bg-gray-50 border border-gray-200 p-3 rounded-md max-h-80 overflow-auto">
            {typeof progressResult === "string"
              ? progressResult
              : JSON.stringify(progressResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
