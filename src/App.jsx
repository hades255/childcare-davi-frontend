import ChecksPage from "./components/ChecksPage";
import { ChecksProvider } from "./contexts/ChecksContext";

function App() {
  return (
    <ChecksProvider>
      <ChecksPage />
    </ChecksProvider>
  );
}

export default App;
