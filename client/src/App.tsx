import { Link, Route, Routes } from "react-router-dom";
import { History, LayoutDashboard, Sparkles } from "lucide-react";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import ProblemDetails from "./pages/ProblemDetails";
import Practice from "./pages/Practice";
import Feedback from "./pages/Feedback";
import HistoryPage from "./pages/History";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <div className="brand-mark">L</div>
          <div>
            <strong>LLD Forge</strong>
            <span>Design. Submit. Improve.</span>
          </div>
        </Link>

        <nav>
          <Link to="/problems">
            <LayoutDashboard size={16} /> Problems
          </Link>
          <Link to="/history">
            <History size={16} /> History
          </Link>
        </nav>
      </header>

      <main>{children}</main>

      <footer>
        <Sparkles size={15} /> Focused LLD practice MVP
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:id" element={<ProblemDetails />} />
        <Route path="/practice/:id" element={<Practice />} />
        <Route path="/feedback/:id" element={<Feedback />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Layout>
  );
}
