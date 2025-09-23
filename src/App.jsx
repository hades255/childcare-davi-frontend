import ChecksPage from "./components/ChecksPage";
import { ChecksProvider } from "./contexts/ChecksContext";

function App() {
  return (
    <ChecksProvider>
      <div className="flex justify-center">
        <ChecksPage />
      </div>
    </ChecksProvider>
  );
}

export default App;
