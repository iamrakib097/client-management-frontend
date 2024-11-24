import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Space,
  Breadcrumb,
  Card,
  Empty,
  Input,
  Descriptions,
} from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import api from "../ulits/api";
const fetchClients = async () => {
  try {
    const response = await api.get("/clients");
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    if (error.response) {
      console.error("Response error:", error.response.data);
      throw new Error(error.response.data.message || "Failed to fetch clients");
    } else if (error.request) {
      console.error("Request error:", error.request);
      throw new Error("No response from the server");
    } else {
      throw new Error("Error fetching clients");
    }
  }
};

const Client = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getClients = async () => {
      const clientData = await fetchClients();
      const sortedClients = clientData.sort((a, b) => b.id - a.id);
      setClients(sortedClients);
      setFilteredClients(sortedClients);
    };

    getClients();
  }, []);
  console.log(clients);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(value) ||
        client.email.toLowerCase().includes(value)
    );
    setFilteredClients(filtered);
  };

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
      render: (text, client) => (
        <Link
          to={`/clients/${client.id}`}
          className="text-gray-700 font-semibold  transition duration-300 hover:text-orange-700"
        >
          {text}
        </Link>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <Typography.Text className="text-sm text-gray-600">
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Client Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Typography.Text className="text-sm text-gray-600">
          {status || "N/A"}
        </Typography.Text>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Action",
      key: "action",
      render: (client) => (
        <Space>
          <Link to={`/clients/${client.id}`}>
            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              View Project
            </button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="md:py-5 bg-gray-100 min-h-screen">
      <Breadcrumb className="mb-4 ">
        <Breadcrumb.Item>
          <HomeOutlined />
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <UserOutlined />
          <Link to="/client">Clients</Link>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card bordered={false} className="bg-white shadow-md rounded-lg p-6">
        <Descriptions title="Client Information" bordered></Descriptions>
        <div className="mb-6">
          <Input
            placeholder="Search by client name or email"
            value={searchTerm}
            onChange={handleSearch}
            className="mt-10 w-full px-4 py-2 border-[1px] border-slate-500  rounded-md focus:outline-none"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="id"
          pagination={{
            pageSize: 10,
            position: ["bottomRight"],
            className: "py-4",
          }}
          bordered={false}
          scroll={{
            x: "max-content",
          }}
          className="shadow-sm rounded-lg"
          locale={{
            emptyText: (
              <Empty
                description="No Clients Found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default Client;
