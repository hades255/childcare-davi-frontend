import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Compliance Check" },
    { path: "/create-vgc-list", label: "Create VGC List" },
  ];

  return (
    <div className="w-[300px] bg-white border-r-2 border-[#23BD92]/30 min-h-screen p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-[#23BD92] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

