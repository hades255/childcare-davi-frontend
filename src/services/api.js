// Lightweight API client for uploads and checks

import { getKeyFromFileName } from "../helpers/file";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const FileKind = {
  STAFF_PLANNING: "staff-planning",
  CHILD_PLANNING: "child-planning",
  CHILD_REGISTRATION: "child-registration",
  VGC_LIST: "fixed-faces",
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function uploadFile(file, kind) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", kind);
  return request("/uploads", {
    method: "POST",
    body: formData,
  });
}

export async function getFileStatus(fileKey) {
  return request(`/documents/status?keys=${fileKey}`, {
    method: "GET",
  });
}

export function getFileDownloadUrl(filePath) {
  return `${API_BASE_URL}${filePath}`;
}

export function getFileViewUrl(fileKey) {
  return `${API_BASE_URL}/files/${encodeURIComponent(fileKey)}/view`;
}

//  todo    create remove file endpoint on server side
export async function removeFile(fileKey) {
  return request(`/files/${encodeURIComponent(fileKey)}`, {
    method: "DELETE",
  });
}

export async function startCheck(body) {
  return request("/checks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getCheckProgress(checkId) {
  return request(`/checks/${encodeURIComponent(checkId)}`, {
    method: "GET",
  });
}

export async function getModuleDocuments(module) {
  return request(`/requirements?modules=${encodeURIComponent(module)}`, {
    method: "GET",
  });
}
