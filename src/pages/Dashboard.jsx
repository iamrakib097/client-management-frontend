import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Spin, message, Table } from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  DollarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../ulits/api";

// Helper function to parse currency data
const parseCurrency = (currencyString) => {
  const regex = /(\d*\.?\d+)\s*([A-Za-z]+)/;
  const match = currencyString.match(regex);
  if (match) {
    const value = parseFloat(match[1]);
    const currency = match[2].trim().toUpperCase();
    return { currency, value };
  }
  return { currency: "UNKNOWN", value: 0 };
};

const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        // Fetch clients and projects concurrently
        const [clientsResponse, projectsResponse] = await Promise.all([
          api.get("/clients"),
          api.get("/projects"),
        ]);

        setClients(clientsResponse.data); // Axios automatically parses JSON
        setProjects(projectsResponse.data);
      } catch (error) {
        console.error("Error loading data:", error);
        const errorMessage =
          error.response?.data?.message || "Error loading dashboard data.";
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mt-[50px] h-screen items-center">
        <Spin size="large" />
      </div>
    );
  }

  const ongoingProjectsByType = {};

  projects.forEach((project) => {
    if (project.status === "Ongoing") {
      if (!ongoingProjectsByType[project.project_type]) {
        ongoingProjectsByType[project.project_type] = 0;
      }
      ongoingProjectsByType[project.project_type]++;
    }
  });

  const ongoingProjectsData = Object.entries(ongoingProjectsByType).map(
    ([projectType, count]) => ({
      projectType,
      count,
    })
  );
  console.log(ongoingProjectsData);

  const totalBudgetByCurrency = {};
  const totalReceivedByCurrency = {};
  const projectStatus = {
    Pending: 0,
    Ongoing: 0,
    Completed: 0,
    Cancelled: 0,
    Pause: 0,
  };
  const projectsByClient = {};

  let totalReceivedAmount = 0;
  let totalBudget = 0;

  projects.forEach((project) => {
    const { currency: budgetCurrency, value: budgetValue } = parseCurrency(
      project.budget
    );
    totalBudgetByCurrency[budgetCurrency] =
      (totalBudgetByCurrency[budgetCurrency] || 0) + budgetValue;
    totalBudget += budgetValue;

    project.financialRecords.forEach((record) => {
      const { currency: receivedCurrency, value: receivedValue } =
        parseCurrency(record.received_amount);
      totalReceivedByCurrency[receivedCurrency] =
        (totalReceivedByCurrency[receivedCurrency] || 0) + receivedValue;
      totalReceivedAmount += receivedValue;
    });

    if (projectStatus[project.status] !== undefined) {
      projectStatus[project.status]++;
    }

    if (!projectsByClient[project.client_id]) {
      projectsByClient[project.client_id] = 0;
    }
    projectsByClient[project.client_id]++;
  });

  const projectStatusData = Object.entries(projectStatus).map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  const clientProjectsData = Object.entries(projectsByClient).map(
    ([clientId, count]) => ({
      clientId,
      count,
      clientName:
        clients.find((client) => client.id === parseInt(clientId))?.name ||
        "Unknown",
    })
  );

  const renderCurrencyData = (data) =>
    Object.entries(data).map(([currency, total]) => (
      <p key={currency} className="currency-text">
        <DollarOutlined /> {currency}: {total.toFixed(2)}
      </p>
    ));

  const columns = [
    {
      title: "Project Type",
      dataIndex: "projectType",
      key: "projectType",
      filters: Object.keys(ongoingProjectsByType).map((projectType) => ({
        text: projectType,
        value: projectType,
      })),
      onFilter: (value, record) => record.projectType.includes(value),
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
    },
  ];

  const projectsByYearAndType = {};

  projects.forEach((projects) => {
    const year = new Date(projects.start_time).getFullYear();
    const projectType = projects.project_type;

    if (!projectsByYearAndType[year]) {
      projectsByYearAndType[year] = {};
    }

    if (!projectsByYearAndType[year][projectType]) {
      projectsByYearAndType[year][projectType] = 0;
    }

    projectsByYearAndType[year][projectType]++;
  });

  const projectsByYearAndTypeData = Object.entries(
    projectsByYearAndType
  ).flatMap(([year, types]) =>
    Object.entries(types).map(([type, count]) => ({
      year,
      projectType: type,
      count,
    }))
  );

  const columnsYearAndType = [
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      sorter: (a, b) => a.year - b.year,
      filters: [
        ...new Set(projectsByYearAndTypeData.map((item) => item.year)),
      ].map((year) => ({
        text: year,
        value: year,
      })),
      onFilter: (value, record) => record.year === value,
    },
    {
      title: "Project Type",
      dataIndex: "projectType",
      key: "projectType",
      filters: [
        ...new Set(projectsByYearAndTypeData.map((item) => item.projectType)),
      ].map((projectType) => ({
        text: projectType,
        value: projectType,
      })),
      onFilter: (value, record) => record.projectType === value,
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
    },
  ];

  return (
    <div className="dashboard md:p-5 mt-4">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title={
              <span>
                <DollarCircleOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                Total Budget
              </span>
            }
            bordered={false}
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
              borderRadius: "10px",
              padding: "24px",
              height: "100%",
            }}
          >
            {renderCurrencyData(totalBudgetByCurrency)}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title={
              <span>
                <DollarCircleOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                Total Received
              </span>
            }
            bordered={false}
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
              borderRadius: "10px",
              padding: "24px",
              height: "100%",
            }}
          >
            {renderCurrencyData(totalReceivedByCurrency)}
          </Card>
        </Col>

        {/* Total Clients and Total Projects */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            title="Clients"
            bordered={false}
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
              borderRadius: "10px",
              padding: "24px",
              height: "100%",
            }}
          >
            <Statistic
              title="Total Clients"
              value={clients.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3b6ccf" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title="Projects"
            bordered={false}
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
              borderRadius: "10px",
              padding: "24px",
              height: "100%",
            }}
          >
            <Statistic
              title="Total Projects"
              value={projects.length}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: "#28a745" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} sm={12} lg={12}>
          <Card
            title="Project Status"
            bordered={false}
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
              borderRadius: "10px",
              padding: "24px",
              height: "100%",
            }}
          >
            <div style={{ height: "300px" }}>
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    fill="#6c757d"
                    label
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Pending"
                            ? "#FF5F15"
                            : entry.name === "Ongoing"
                            ? "#FFC000"
                            : entry.name === "Completed"
                            ? "#008000"
                            : entry.name === "Pause"
                            ? "#1B1212"
                            : "#D2042D"
                        }
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={12}>
          <Card
            title="Ongoing Projects by Type"
            bordered={false}
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
              borderRadius: "10px",

              height: "100%",
            }}
          >
            <div className="table-container">
              <Table
                columns={columns}
                dataSource={ongoingProjectsData}
                rowKey="projectType"
                pagination={{ pageSize: 5 }}
                scroll={{ x: "max-content" }}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card
            title="Number of Projects by Year and Type"
            bordered={false}
            style={{
              background: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
              borderRadius: "10px",
            }}
          >
            <Table
              columns={columnsYearAndType}
              dataSource={projectsByYearAndTypeData}
              rowKey={(record) => `${record.year}-${record.projectType}`}
              pagination={{ pageSize: 5 }}
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
