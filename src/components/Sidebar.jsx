import { Flex, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import React from "react";

import {
  LogoutOutlined,
  DashboardOutlined,
  UserOutlined,
  UserAddOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const Sidebar = ({ collapsed, onLogout }) => {
  const location = useLocation();

  // Define menu items with route paths as keys
  const menuItems = [
    {
      key: "/",
      label: <Link to="/">Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
    {
      key: "/client",
      label: <Link to="/client">Client</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "/create-client",
      label: <Link to="/create-client">Create Client</Link>,
      icon: <UserAddOutlined />,
    },
    {
      key: "/setting",
      label: <Link to="/setting">Setting</Link>,
      icon: <SettingOutlined />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: onLogout,
    },
  ];

  return (
    <>
      <Flex align="center" justify="center">
        <img
          src="https://rafusoft.com/assets/img/rafusoft-logo.svg"
          alt="Rafusoft Logo"
          width={130}
          className="m-[28px]"
        />
      </Flex>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]} // Highlight based on current route
        className="menu-bar"
        items={menuItems}
      />
    </>
  );
};

export default Sidebar;
