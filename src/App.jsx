import { BrowserRouter, Routes, Route } from "react-router-dom";
import ComplianceCheck from "./ComplianceCheck/ComplianceCheck";
import CreateVGCList from "./CreateVGCList/CreateVGCList";
import ToastContainer from "./ComplianceCheck/components/toast";
import { ToastProvider } from "./ComplianceCheck/contexts/ToastContext";
import { I18nProvider } from "./contexts/i18n/I18nContext";
import { ThemeProvider } from "./contexts/theme/ThemeContext";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <ToastProvider>
            <div className="flex justify-center">
              <div className="container w-full">
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 flex justify-center">
                    <Routes>
                      <Route path="/" element={<ComplianceCheck />} />
                      <Route
                        path="/create-vgc-list"
                        element={<CreateVGCList />}
                      />
                    </Routes>
                  </div>
                </div>
              </div>
            </div>
            <ToastContainer />
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}

export default App;
