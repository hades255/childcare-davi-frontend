import ComplianceCheck from "./ComplianceCheck/ComplianceCheck";
import ToastContainer from "./ComplianceCheck/components/toast";
import { ToastProvider } from "./ComplianceCheck/contexts/ToastContext";

function App() {
  return (
    <div className="flex justify-center">
      <ToastProvider>
        <ComplianceCheck />
        <ToastContainer />
      </ToastProvider>
    </div>
  );
}

export default App;
