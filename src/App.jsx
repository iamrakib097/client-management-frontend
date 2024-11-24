import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Button, Layout, Drawer } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import Sidebar from "./components/Sidebar";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { decodeJWT } from "./ulits/decode";
import Dashboard from "./pages/Dashboard";
import Client from "./pages/Client";
import CreateClient from "./pages/CreateClient";
import ClientDetail from "./pages/ClientDetail";
import Login from "./pages/Login";
import ProjectDetail from "./pages/ProjectDetail";
import ClientInfo from "./pages/ClientInfo";
import Setting from "./pages/Setting";
import api from "./ulits/api";
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState === "true";
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setDrawerVisible(!drawerVisible);
    } else {
      setCollapsed((prev) => {
        const newState = !prev;
        localStorage.setItem("sidebarCollapsed", newState);
        return newState;
      });
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;
      console.log(token, user);

      if (token) {
        localStorage.setItem("token", token);
        const decodedToken = decodeJWT(token);
        const { id, name, email, role } = decodedToken;
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", name);
        localStorage.setItem("userRole", role);
        localStorage.setItem("email", email);

        setUsername(name);
        setUserRole(role);

        setIsAuthenticated(true);
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setUserRole(null);
    localStorage.clear();
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : userRole === "Client" ? (
        <Routes>
          <Route
            path="/client-info"
            element={<ClientInfo onLogout={handleLogout} />}
          />
          <Route
            path="*"
            element={<Navigate to="/client-info" onLogOut={handleLogout} />}
          />
        </Routes>
      ) : (
        <Layout>
          {isMobile ? (
            <Drawer
              title="Menu"
              placement="left"
              onClose={() => setDrawerVisible(false)}
              visible={drawerVisible}
              bodyStyle={{ padding: 0 }}
              width={250}
            >
              <Sidebar collapsed={collapsed} onLogout={handleLogout} />
            </Drawer>
          ) : (
            <Sider
              theme="light"
              trigger={null}
              collapsible
              collapsed={collapsed}
              className="h-screen sticky top-0"
              width={240}
              collapsedWidth={80}
            >
              <Sidebar collapsed={collapsed} onLogout={handleLogout} />
            </Sider>
          )}

          <Layout className="site-layout">
            <Header className="flex items-center gap-4 bg-white px-4 shadow-sm fixed w-full z-10">
              <Button
                type="text"
                icon={
                  collapsed || isMobile ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )
                }
                onClick={toggleSidebar}
                className="text-xl"
              />
              <h1 className="text-lg font-semibold">{username}</h1>
            </Header>

            <Content className="p-4 pt-[64px] h-full overflow-auto py-20">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/client" element={<Client />} />
                <Route path="/create-client" element={<CreateClient />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      )}
    </Router>
  );
};

export default App;
