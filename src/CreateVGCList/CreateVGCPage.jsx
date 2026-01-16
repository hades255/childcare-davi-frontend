import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { useToast } from "../ComplianceCheck/contexts/ToastContext";
import { useChecks } from "../ComplianceCheck/contexts/ChecksContext";
import {
  FileKind,
  uploadFile,
  startCreatingVGCList,
  getCheckVGCCreatingProgress,
} from "../ComplianceCheck/services/api";
import FileUploadCard from "../ComplianceCheck/components/FileUploadCard";
import ComplianceCheckButton from "../ComplianceCheck/components/ComplianceCheckButton";
import VGCProgressBar from "./components/VGCProgressBar";
import Button from "../ComplianceCheck/components/Button";
import VGCResultTable from "./VGCResultTable";
import { downloadJSON, downloadExcel, downloadDOC } from "./utils/download";

const UploadSection = memo(function UploadSection({ title, kind }) {
  const { addToast } = useToast();
  const { fileMap, onAdded } = useChecks();
  const [isUploading, setIsUploading] = useState(false);

  const file = fileMap[kind];

  const handlePickAndUpload = useCallback(
    async function handlePickAndUpload() {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,application/pdf";
        input.onchange = async () => {
          if (input.files && input.files[0]) {
            setIsUploading(true);
            try {
              const result = await uploadFile(input.files[0], kind);
              onAdded(kind, result);
              addToast({
                type: "success",
                message: "Bestand geüpload",
              });
            } catch (e) {
              addToast({
                type: "error",
                message: e.message || "Upload mislukt",
              });
            } finally {
              setIsUploading(false);
            }
          }
        };
        input.click();
      } catch (e) {
        addToast({ type: "error", message: e.message || "Upload mislukt" });
      }
    },
    [kind, onAdded, addToast]
  );

  return (
    <FileUploadCard kind={kind}>
      <ComplianceCheckButton
        onClick={handlePickAndUpload}
        disabled={isUploading}
        variant={isUploading ? "uploading" : file ? "uploaded" : "normal"}
      >
        {isUploading ? "uploaden..." : file ? "Bestand geüpload" : title}
      </ComplianceCheckButton>
    </FileUploadCard>
  );
});

const uploadSectionItems = [
  { title: "Upload kindplanning", kind: FileKind.CHILD_PLANNING },
  { title: "Upload kindregistratie", kind: FileKind.CHILD_REGISTRATION },
  { title: "Upload personeelsplanning", kind: FileKind.STAFF_PLANNING },
];

export default function CreateVGCPage() {
  const { addToast } = useToast();
  const { fileMap } = useChecks();

  const [isCreating, setIsCreating] = useState(false);
  const [progressCheckId, setProgressCheckId] = useState("");
  const [progressResult, setProgressResult] = useState(null);
  const [vgcResult, setVgcResult] = useState(null);

  const validation = useMemo(() => {
    const hasStaff = fileMap[FileKind.STAFF_PLANNING];
    const hasChildPlan = fileMap[FileKind.CHILD_PLANNING];
    const hasReg = fileMap[FileKind.CHILD_REGISTRATION];

    const missing = [];
    if (!hasStaff) missing.push("personeelsplanning");
    if (!hasChildPlan) missing.push("kindplanning");
    if (!hasReg) missing.push("kindregistratie");

    return {
      hasStaff,
      hasChildPlan,
      hasReg,
      missing,
      canStart: hasStaff && hasChildPlan && hasReg,
    };
  }, [fileMap]);

  async function handleStartCreating() {
    if (!validation.canStart) {
      addToast({
        type: "error",
        message: `Ontbrekende documenten: ${validation.missing.join(", ")}`,
      });
      return;
    }

    const documentKeys = [
      fileMap[FileKind.STAFF_PLANNING]?.objectKey,
      fileMap[FileKind.CHILD_PLANNING]?.objectKey,
      fileMap[FileKind.CHILD_REGISTRATION]?.objectKey,
    ].filter(Boolean);

    try {
      setIsCreating(true);
      const res = await startCreatingVGCList({
        documentKeys,
      });
      setProgressResult(null);
      setVgcResult(null);
      setProgressCheckId(res.check_id);
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        message: e.message || "VGC lijst aanmaken mislukt",
      });
    } finally {
      setIsCreating(false);
    }
  }

  function handleProgressComplete(res) {
    setProgressResult(res);
    if (res.result) {
      setVgcResult(res.result);
    }
  }

  async function handleGetProgress() {
    if (!progressCheckId) {
      addToast({
        type: "error",
        message: "Voer een check ID in.",
      });
      return;
    }
    try {
      const res = await getCheckVGCCreatingProgress(progressCheckId);
      setProgressResult(res);
      if (res.status?.message === "completed" && res.result) {
        setVgcResult(res.result);
      }
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        message: e.message || "Voortgang ophalen mislukt",
      });
    }
  }

  const handleDownloadJSON = () => {
    if (vgcResult) {
      downloadJSON(vgcResult, "vgc-list.json");
    }
  };

  const handleDownloadExcel = () => {
    if (vgcResult) {
      downloadExcel(vgcResult, "vgc-list.xlsx");
    }
  };

  const handleDownloadDOC = () => {
    if (vgcResult) {
      downloadDOC(vgcResult, "vgc-list.docx");
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 p-4 mx-auto">
      <div className="w-full flex flex-col gap-3 min-h-[50vh]">
        <h2 className="text-2xl font-bold">VGC Lijst Aanmaken</h2>
        <p className="my-4 text-gray-800">Upload de benodigde documenten</p>

        <div className="flex gap-4 flex-col">
          {uploadSectionItems.map((item, index) => (
            <UploadSection key={index} {...item} />
          ))}
        </div>

        <div className="flex gap-2 items-center mt-4">
          <Button
            onClick={handleStartCreating}
            disabled={!validation.canStart || isCreating}
            variant="normal"
            title={
              !validation.canStart && validation.missing.length
                ? `Ontbrekende: ${validation.missing.join(", ")}`
                : undefined
            }
          >
            {isCreating ? "Aanmaken…" : "Create VGC List"}
          </Button>
        </div>

        {progressCheckId && (
          <VGCProgressBar
            checkId={progressCheckId}
            onComplete={handleProgressComplete}
          />
        )}

        <div className="border-t border-gray-200 pt-3 flex flex-col gap-2 mt-4">
          <strong>Check Voortgang</strong>
          <div className="flex gap-2 items-center flex-wrap">
            <input
              value={progressCheckId}
              onChange={(e) => setProgressCheckId(e.target.value)}
              placeholder="Voer check id in"
              className="px-2 py-1 border border-gray-300 rounded-md"
            />
            <Button onClick={handleGetProgress} variant="secondary">
              Get Progress
            </Button>
          </div>
        </div>

        {vgcResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">VGC Lijst Resultaat</h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadJSON}
                  variant="secondary"
                  icon="download"
                >
                  Download JSON
                </Button>
                <Button
                  onClick={handleDownloadExcel}
                  variant="secondary"
                  icon="download"
                >
                  Download Excel
                </Button>
                <Button
                  onClick={handleDownloadDOC}
                  variant="secondary"
                  icon="download"
                >
                  Download DOC
                </Button>
              </div>
            </div>
            <VGCResultTable data={vgcResult} />
          </div>
        )}
      </div>
    </div>
  );
}

