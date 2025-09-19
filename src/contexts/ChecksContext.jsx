import React, { createContext, useCallback, useContext, useState } from "react";
import { FileKind } from "../services/api";

const ChecksContext = createContext(null);

export const ChecksProvider = ({ children }) => {
  const [fileMap, setFileMap] = useState({
    [FileKind.STAFF_PLANNING]: [],
    [FileKind.CHILD_PLANNING]: [],
    [FileKind.CHILD_REGISTRATION]: [],
    [FileKind.VGC_LIST]: [],
  });

  const handleRemoved = useCallback(function handleRemoved(kind, key) {
    setFileMap((prev) => ({
      ...prev,
      [kind]: (prev[kind] || []).filter((f) => f.objectKey !== key),
    }));
  }, []);

  const handleAdded = useCallback(function handleAdded(kind, item) {
    setFileMap((prev) => {
      const existing = prev[kind] || [];
      if (existing.some((x) => x.objectKey === item.objectKey)) return prev;
      return {
        ...prev,
        [kind]: [...existing, item],
      };
    });
  });

  return (
    <ChecksContext.Provider
      value={{ fileMap, onRemoved: handleRemoved, onAdded: handleAdded }}
    >
      {children}
    </ChecksContext.Provider>
  );
};

export const useChecks = () => {
  const context = useContext(ChecksContext);
  if (!context) {
    throw new Error("useChecks must be used within a ChecksProvider");
  }
  return context;
};

export default ChecksContext;
