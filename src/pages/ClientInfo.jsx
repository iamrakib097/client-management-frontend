import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spin, message, Typography } from "antd";
import { extractCurrencyAndAmount } from "../ulits/utils";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import api from "../ulits/api";
import {
  DollarCircleOutlined,
  InfoCircleOutlined,
  MoneyCollectTwoTone,
  AppstoreAddOutlined,
  MoneyCollectOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Footer from "../components/Footer";

const generateInvoicePDF = (project, client) => {
  const { name: projectName, start_time, budget, financialRecords } = project;
  const { name: clientName, phone, email, address, id: clientId } = client;
  const paymentDetails = financialRecords.map((item) => ({
    payment_date: item.payment_date,
    description: item.description,
    amount: item.received_amount,
  }));
  const { currency: projectCurrency, amount: projectAmount } =
    extractCurrencyAndAmount(project?.budget || "");
  const calculateSubtotal = (records) => {
    return records.reduce(
      (acc, record) => acc + parseFloat(record.received_amount),
      0
    );
  };

  const calculateDuePrice = () => {
    const subtotal = calculateSubtotal(financialRecords);
    return projectAmount - subtotal;
  };
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  doc.text("Client", 14, 45);
  doc.text(`Client Name: ${clientName} [${clientId}]`, 14, 50);
  doc.text(`Email: ${email}`, 14, 55);
  doc.text(`Phone: ${phone}`, 14, 60);
  doc.text(`Address: ${address}`, 14, 65);

  doc.setFont("helvetica", "bold");
  doc.text("Project", 140, 45);
  doc.text(`Project Name: ${projectName}`, 140, 50);

  doc.text(`Issue date: ${dayjs(start_time).format("DD MMM YYYY")}`, 140, 55);

  doc.text(
    `Budget: ${parseFloat(budget).toFixed(2) + " " + projectCurrency}`,
    140,
    60
  );

  doc.text(
    `Due: ${calculateDuePrice().toFixed(2)} ${projectCurrency}`,
    140,
    65
  );

  doc.line(14, 68, 196, 68);

  doc.setFillColor(112, 112, 112);
  const headerHeight = 18;
  const headerY = 70;
  doc.rect(14, headerY, 182, headerHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  const startX = 14;
  const colWidth = 60;
  const textY = headerY + 7;

  doc.text("Project Name", 2 + startX, textY);
  doc.text("Issue Date", 2 + startX + colWidth, textY);
  doc.text("Budget", 2 + startX + 2 * colWidth, textY);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const projectNameText = `${projectName}`;
  const issueDateText = `${dayjs(start_time).format("DD MMM YYYY")}`;
  const budgetText = `${parseFloat(budget).toFixed(2) + " " + projectCurrency}`;

  const maxTextWidth = colWidth - 4;

  const projectNameLines = doc.splitTextToSize(projectNameText, maxTextWidth);
  const issueDateLines = doc.splitTextToSize(issueDateText, maxTextWidth);
  const budgetLines = doc.splitTextToSize(budgetText, maxTextWidth);

  doc.text(projectNameLines, 2 + startX, textY + 5);
  doc.text(issueDateLines, 2 + startX + colWidth, textY + 5);
  doc.text(budgetLines, 2 + startX + 2 * colWidth, textY + 5);

  doc.line(startX, headerY, startX + 182, headerY);
  doc.line(startX, headerY, startX, headerY + headerHeight);
  doc.line(startX + 182, headerY, startX + 182, headerY + headerHeight);
  doc.line(
    startX,
    headerY + headerHeight,
    startX + 182,
    headerY + headerHeight
  );

  doc.line(
    startX + colWidth,
    headerY,
    startX + colWidth,
    headerY + headerHeight
  );
  doc.line(
    startX + 2 * colWidth,
    headerY,
    startX + 2 * colWidth,
    headerY + headerHeight
  );

  doc.setTextColor(0, 0, 0);

  const totalBudget = paymentDetails
    .reduce((acc, detail) => acc + parseFloat(detail.amount), 0)
    .toFixed(2);

  doc.autoTable({
    head: [["Payment Date", "Description", "Amount"]],
    body: paymentDetails.map((detail) => [
      dayjs(detail.payment_date).format("DD MMM YYYY"),
      detail.description,
      `${parseFloat(detail.amount).toFixed(2)} ${projectCurrency}`,
    ]),
    startY: 89,
    margin: { horizontal: 14 },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60.6666666667, overflow: "linebreak" },
      1: { cellWidth: 60.6666666667, overflow: "linebreak" },
      2: { cellWidth: 60.6666666667, overflow: "linebreak" },
    },
  });
  const tableX = 14;
  const tableWidth = 182;
  const amountColumnX = tableX + 2 * (tableWidth / 3);

  doc.setTextColor(0, 0, 0);

  const subtotalX = amountColumnX - 16;
  const totalX = amountColumnX + 6.5;

  doc.text("Subtotal: ", subtotalX, doc.lastAutoTable.finalY + 10);

  doc.text(
    `${totalBudget} ${projectCurrency}`,
    totalX - 5.3,
    doc.lastAutoTable.finalY + 10
  );

  const pdfOutput = doc.output("bloburl");
  window.open(pdfOutput, "_blank");
};
const parseCurrency = (currencyString) => {
  if (typeof currencyString !== "string") {
    console.error("Invalid currency string (not a string):", currencyString);
    return { currency: "UNKNOWN", value: 0 };
  }

  const regex = /(\d*\.?\d+)\s*([A-Za-z]+)/;
  const match = currencyString.match(regex);

  if (match) {
    const value = parseFloat(match[1]);
    const currency = match[2].trim().toUpperCase();
    return { currency, value };
  }

  console.error(
    "Invalid currency string format (unable to match):",
    currencyString
  );
  return { currency: "UNKNOWN", value: 0 };
};

const calculateTotalGiven = (financialRecords) => {
  let totalGivenAmount = 0;
  const totalReceivedByCurrency = {};

  financialRecords.forEach((record) => {
    const { received_amount } = record;

    if (received_amount && typeof received_amount === "string") {
      const { currency, value } = parseCurrency(received_amount);

      if (currency !== "UNKNOWN") {
        totalReceivedByCurrency[currency] =
          (totalReceivedByCurrency[currency] || 0) + value;
        totalGivenAmount += value;
      } else {
        console.warn(
          `Skipping invalid received_amount format: ${received_amount}`
        );
      }
    } else {
      console.warn(
        `Received_amount is not a valid string or missing: ${received_amount}`
      );
    }
  });

  return { totalGivenAmount, totalReceivedByCurrency };
};

const ClientInfo = ({ onLogout }) => {
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const email = localStorage.getItem("email");

    if (!email) {
      message.error("No email found in localStorage.");
      return;
    }

    const getData = async () => {
      try {
        // Fetch all clients data
        const { data: clients } = await api.get("/clients");

        const foundClient = clients.find((client) => client.email === email);

        if (foundClient) {
          setClient(foundClient);
        } else {
          message.error("No client found with this email.");
          return;
        }

        const { data: projectsData } = await api.get("/projects");
        setProjects(projectsData);
        setLoading(false);
      } catch (error) {
        console.error("Error details:", error.response || error.message);
        message.error("Error loading client data or projects.");
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const totalBudgetByCurrency = {};
  const totalReceivedByCurrency = {};

  let totalReceivedAmount = 0;
  let totalBudget = 0;

  const clientProjects = projects.filter(
    (project) => project.client_id === client.id
  );

  clientProjects.forEach((project) => {
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
  });

  return (
    <>
      <nav className="bg-white text-black py-4 px-8 flex items-center justify-between shadow-sm">
        <div className="flex justify-start items-center">
          <img
            src="https://rafusoft.com/assets/img/rafusoft-logo.svg"
            alt="Rafusoft Logo"
            width={180}
            height={50}
          />
        </div>

        <h1 className=" hidden md:block text-slate-700 text-2xl uppercase font-semibold text-center flex-1">
          Project Details
        </h1>

        <button
          className="bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-400 transition duration-300"
          onClick={onLogout}
        >
          Logout
        </button>
      </nav>
      <div className="client-info p-10">
        <Row gutter={[24, 24]}>
          <Col
            xs={24}
            md={6}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Card
              title="Basic Info"
              bordered
              extra={
                <InfoCircleOutlined
                  style={{ fontSize: 24, color: "#1890ff" }}
                />
              }
              style={{
                width: "100%",
                backgroundColor: "#fff",
                boxShadow: "0 3px 3px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                padding: "10px",
                flex: 1,
              }}
            >
              <p>
                <Typography.Text strong>Name:</Typography.Text> {client?.name}
              </p>
              <p>
                <Typography.Text strong>Company:</Typography.Text>{" "}
                {client?.company}
              </p>
              <p>
                <Typography.Text strong>Email:</Typography.Text> {client?.email}
              </p>
              <p>
                <Typography.Text strong>Phone:</Typography.Text> {client?.phone}
              </p>
              <p>
                <Typography.Text strong>Address:</Typography.Text>{" "}
                {client?.address}
              </p>
            </Card>
          </Col>

          {/* Total Budget */}
          <Col
            xs={24}
            sm={12}
            lg={6}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Card
              title="Total Budget"
              bordered
              extra={
                <MoneyCollectTwoTone
                  style={{ fontSize: 24, color: "#1890ff" }}
                />
              }
              style={{
                width: "100%",
                backgroundColor: "#fff",
                boxShadow: "0 3px 3px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                textAlign: "center",
                padding: "10px",
                flex: 1,
              }}
            >
              {Object.entries(totalBudgetByCurrency).map(
                ([currency, total]) => (
                  <p key={currency}>
                    {total.toFixed(2)} {currency}
                  </p>
                )
              )}
            </Card>
          </Col>

          {/* Total Received */}
          <Col
            xs={24}
            sm={12}
            lg={6}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Card
              title="Total Given"
              bordered
              extra={
                <MoneyCollectOutlined
                  style={{ fontSize: 24, color: "#1890ff" }}
                />
              }
              style={{
                width: "100%",
                backgroundColor: "#fff",
                boxShadow: "0 3px 3px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                textAlign: "center",
                padding: "10px",
                flex: 1,
              }}
            >
              {Object.entries(totalReceivedByCurrency).map(
                ([currency, total]) => (
                  <p key={currency}>
                    {(total && total !== "" ? total : 0).toFixed(2)} {currency}
                  </p>
                )
              )}
            </Card>
          </Col>

          {/* Total Projects */}
          <Col
            xs={24}
            sm={12}
            lg={6}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Card
              title="Total Projects"
              bordered
              extra={
                <AppstoreAddOutlined
                  style={{ fontSize: 24, color: "#1890ff" }}
                />
              }
              style={{
                width: "100%",
                backgroundColor: "#fff",
                boxShadow: "0 3px 3px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                textAlign: "center",
                padding: "10px",
                flex: 1,
              }}
            >
              <Typography.Title level={2}>
                {clientProjects.length}
              </Typography.Title>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-10">
          {clientProjects.map((project) => {
            const { totalGivenAmount } = calculateTotalGiven(
              project.financialRecords
            );

            return (
              <Col xs={24} key={project.id}>
                <Card
                  className="flex flex-col w-full"
                  style={{
                    backgroundColor: "#fff",
                  }}
                >
                  <div className="w-full">
                    <Typography.Title level={4}>
                      {project.name}
                    </Typography.Title>
                  </div>

                  <Row gutter={[8, 8]} className="w-full flex-col md:flex-row">
                    <Col xs={24} sm={12} md={6}>
                      <Card
                        bordered
                        style={{
                          backgroundColor: "#fff",
                          textAlign: "center",
                          height: "100%",
                        }}
                        className="flex items-center justify-center"
                      >
                        <button
                          onClick={() => generateInvoicePDF(project, client)}
                          className=" inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none  transition-all duration-200"
                        >
                          View Details
                        </button>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card
                        bordered
                        className="bg-[#f6ffed] h-full flex flex-col justify-center items-center text-left"
                        hoverable
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <DollarCircleOutlined className="text-[#52c41a] text-xl" />
                          <Typography.Text strong>Budget</Typography.Text>
                        </div>
                        <Typography.Text strong>
                          {parseFloat(project.budget).toFixed(2) +
                            " " +
                            parseCurrency(project.budget)["currency"]}
                        </Typography.Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card
                        bordered
                        className="bg-[#f6ffed] h-full flex flex-col justify-center items-center text-left"
                        hoverable
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <DollarCircleOutlined className="text-[#52c41a] text-xl" />
                          <Typography.Text strong>Total Given</Typography.Text>
                        </div>
                        <Typography.Text strong>
                          {totalGivenAmount.toFixed(2) + " "}
                          {parseCurrency(project.budget)["currency"]}
                        </Typography.Text>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Card
                        bordered
                        className="bg-[#f6ffed] h-full flex flex-col justify-center items-center text-left"
                        hoverable
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircleOutlined
                            style={{
                              fontSize: 20,
                              color:
                                project.status === "Completed"
                                  ? "green"
                                  : "orange",
                            }}
                          />
                          <Typography.Text strong>Status</Typography.Text>
                        </div>
                        <Typography.Text strong>
                          {project.status}
                        </Typography.Text>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
      <Footer />
    </>
  );
};

export default ClientInfo;
