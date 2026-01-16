import CreateVGCPage from "./CreateVGCPage";
import { ChecksProvider } from "../ComplianceCheck/contexts/ChecksContext";

function CreateVGCList() {
  return (
    <ChecksProvider>
      <CreateVGCPage />
    </ChecksProvider>
  );
}

export default CreateVGCList;

