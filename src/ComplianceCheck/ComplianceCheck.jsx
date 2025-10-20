import ChecksPage from "./ChecksPage";
import ToastContainer from "./components/toast";
import { ChecksProvider } from "./contexts/ChecksContext";
import { ToastProvider } from "./contexts/ToastContext";

function ComplianceCheck() {
  return (
    <ToastProvider>
      <ChecksProvider>
        <ChecksPage />
      </ChecksProvider>
      <ToastContainer />
    </ToastProvider>
  );
}

export default ComplianceCheck;
