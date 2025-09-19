import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FileKind,
  uploadFile,
  startCheck,
  getCheckProgress,
  uploadFiles,
  getCheckIds,
} from "../services/api";
import { useChecks } from "../contexts/ChecksContext";
import { formatDate } from "../helpers/date";
import CheckResults from "./ui/CheckResults";
import FileUploadCard from "./ui/FileUploadCard";
import Button from "./ui/Button";
import Toggle from "./ui/Toggle";
import FileItem from "./ui/FileItem";

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

const UploadSection = memo(function UploadSection({ title, kind }) {
  const { fileMap, onAdded } = useChecks();

  const files = fileMap[kind];

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
              onAdded(kind, result);
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
    [kind, onAdded]
  );

  const handlePickAndUploadFiles = useCallback(
    async function handlePickAndUploadFiles() {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept =
          kind === FileKind.VGC_LIST
            ? "application/json"
            : "image/*,application/pdf";
        input.multiple = true;
        input.onchange = async () => {
          if (input.files && input.files.length > 0) {
            setIsUploading(true);
            try {
              const formData = new FormData();
              for (const file of input.files) {
                formData.append("files", file);
              }
              formData.append("document_type", kind);

              const results = await uploadFiles(input.files, kind);

              results.uploadedFiles.forEach((result) => onAdded(kind, result));
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
    [kind, onAdded]
  );

  return (
    <FileUploadCard
      className="min-w-[320px]"
      kind={kind}
      action={
        <Button
          onClick={handlePickAndUploadFiles}
          disabled={isUploading}
          size="sm"
        >
          {isUploading ? "Uploading…" : `Upload ${title}`}
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {files.length === 0 && (
          <span className="text-gray-500">No files uploaded yet.</span>
        )}
        {files.map((f) => (
          <FileItem key={f.objectKey} kind={kind} file={f} />
        ))}
      </div>
    </FileUploadCard>
  );
});

const DateInput = memo(function DateInput({ date, onChange }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col">
      <input
        type="date"
        id="dateInput"
        value={date}
        onChange={handleChange}
        className="border-b border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );
});

const uploadSectionItems = [
  { title: "Staff-Planning", kind: FileKind.STAFF_PLANNING },
  { title: "Child-Planning", kind: FileKind.CHILD_PLANNING },
  { title: "Child-Registration", kind: FileKind.CHILD_REGISTRATION },
  { title: "VGC List (JSON)", kind: FileKind.VGC_LIST },
];

export default function ChecksPage() {
  const { fileMap } = useChecks();

  const [enableBkr, setEnableBkr] = useState(true);
  const [enableVgc, setEnableVgc] = useState(false);
  const [enableThreeHours, setEnableThreeHours] = useState(false);
  const [checkDate, setCheckDate] = useState("");

  const requiredVisibleKinds = useMemo(() => {
    const kinds = new Set([FileKind.STAFF_PLANNING, FileKind.CHILD_PLANNING]);
    if (enableVgc) kinds.add(FileKind.VGC_LIST);
    if (enableThreeHours) kinds.add(FileKind.CHILD_REGISTRATION);
    return Array.from(kinds);
  }, [enableVgc, enableThreeHours]);

  const [isStartingCheck, setIsStartingCheck] = useState(false);
  const [lastCheckId, setLastCheckId] = useState("");
  const [progressCheckId, setProgressCheckId] = useState("");
  const [checkIds, setCheckIds] = useState([]);
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
    if (!checkDate) missing.push("Checking date");

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
        (!enableThreeHours || hasReg) &&
        checkDate,
    };
  }, [fileMap, enableVgc, enableThreeHours, checkDate]);

  const handleDateChange = useCallback(function handleDateChange(value) {
    setCheckDate(value);
  });

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
      ...(fileMap[FileKind.STAFF_PLANNING] || []).map((f) => f.objectKey),
      ...(fileMap[FileKind.CHILD_PLANNING] || []).map((f) => f.objectKey),
      ...(enableVgc
        ? (fileMap[FileKind.VGC_LIST] || []).map((f) => f.objectKey)
        : []),
      ...(enableThreeHours
        ? (fileMap[FileKind.CHILD_REGISTRATION] || []).map((f) => f.objectKey)
        : []),
    ];

    const source = "flexkids";
    const date = formatDate(checkDate);
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
      setCheckIds((prev) => [...prev, checkId]);
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

  useEffect(() => {
    async function getAllCheckIds() {
      try {
        const result = await getCheckIds();
        setCheckIds(result);
      } catch (error) {
        console.log(error);
      }
    }

    getAllCheckIds();
  }, []);

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
              <UploadSection key={index} title={item.title} kind={item.kind} />
            )
        )}
      </div>

      <div className="flex gap-2 items-center">
        <DateInput date={checkDate} onChange={handleDateChange} />
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
          <select
            value={progressCheckId}
            onChange={(e) => setProgressCheckId(e.target.value)}
            placeholder="Enter check id"
            className="w-96 px-2 py-1 border border-gray-300 rounded-md"
          >
            <option value=""></option>
            {checkIds.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button
            onClick={handleGetProgress}
            variant="secondary"
            icon="refresh-cw"
          >
            Get Progress
          </Button>
        </div>

        <CheckResults data={progressResult} />
      </div>
    </div>
  );
}
