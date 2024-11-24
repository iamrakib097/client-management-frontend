import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Flex, InputNumber, Select } from "antd";
import { extractCurrencyAndAmount } from "../ulits/utils";
import moneyImg from "../assets/money.png";
import dueImg from "../assets/due-diligence.png";
import subtotalImg from "../assets/gross.png";
import api from "../ulits/api";
import {
  EditOutlined,
  DeleteOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import {
  Card,
  Table,
  Modal,
  Input,
  Popconfirm,
  Button,
  DatePicker,
  Form,
  message,
  List,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  DollarOutlined,
  HomeOutlined,
  PrinterOutlined,
  ProjectOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";

const fetchProjectById = async (id) => {
  try {
    const response = await api.get(`/project/${id}`); // Axios handles JSON parsing
    return response.data;
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch project data"
    );
  }
};
const fetchClientById = async (id) => {
  try {
    const response = await api.get(`/client/${id}`); // Axios handles the response parsing
    return response.data; // Return the parsed data
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch client data"
    );
  }
};

const createFinancialRecord = async (newRecord) => {
  try {
    const response = await api.post("/payment/", newRecord); // Axios automatically handles JSON stringification
    return response.data; // Return the parsed response data
  } catch (error) {
    console.error("Error creating financial record:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create financial record"
    );
  }
};

const updateFinancialRecord = async (id, updatedRecord) => {
  try {
    const response = await api.put(`/payment/${id}`, updatedRecord); // Axios handles JSON serialization
    return response.data; // Return the parsed response data
  } catch (error) {
    console.error("Error updating financial record:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update financial record"
    );
  }
};

const deleteFinancialRecord = async (id) => {
  try {
    await api.delete(`/payment/${id}`); // Axios handles the DELETE request
  } catch (error) {
    console.error("Error deleting financial record:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete financial record"
    );
  }
};

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState(""); // New project status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState({});

  useEffect(() => {
    const getProject = async () => {
      const projectData = await fetchProjectById(id);
      setProject(projectData);
      const clientData = await fetchClientById(projectData.client_id);
      setClient(clientData);

      setFinancialRecords(projectData.financialRecords);
    };

    getProject();
  }, [id]);
  const showStatusModal = () => {
    setNewStatus(project.status);
    setIsStatusModalVisible(true);
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setNewStatus(value);
  };
  const updateProjectStatus = async (id, status) => {
    try {
      const response = await api.patch(`/project/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating project status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update project status"
      );
    }
  };
  const handleStatusSubmit = async () => {
    try {
      setIsSubmitting(true);
      const updatedProject = await updateProjectStatus(id, newStatus);
      setProject(updatedProject);
      message.success("Project status updated successfully!");
      setIsStatusModalVisible(false);
    } catch (error) {
      message.error("Failed to update project status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
  };

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

  const generateInvoicePDF = () => {
    const { name: projectName, start_time, budget } = project;
    const { name: clientName, phone, email, address, id: clientId } = client;
    const paymentDetails = financialRecords.map((item) => ({
      payment_date: item.payment_date,
      description: item.description,
      amount: item.received_amount,
    }));

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

    // Set up the font and color for the table content
    doc.setTextColor(255, 255, 255); // Black text color
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Define the column data
    const projectNameText = `${projectName}`;
    const issueDateText = `${dayjs(start_time).format("DD MMM YYYY")}`;
    const budgetText = `${
      parseFloat(budget).toFixed(2) + " " + projectCurrency
    }`;

    // Set a maximum width for text wrapping
    const maxTextWidth = colWidth - 4; // Leaving some padding on the sides

    // Break the text into multiple lines if it exceeds the column width
    const projectNameLines = doc.splitTextToSize(projectNameText, maxTextWidth);
    const issueDateLines = doc.splitTextToSize(issueDateText, maxTextWidth);
    const budgetLines = doc.splitTextToSize(budgetText, maxTextWidth);

    // Draw the content for each column
    doc.text(projectNameLines, 2 + startX, textY + 5);
    doc.text(issueDateLines, 2 + startX + colWidth, textY + 5);
    doc.text(budgetLines, 2 + startX + 2 * colWidth, textY + 5);

    // Draw the lines for the table borders
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
    ); // After column 1
    doc.line(
      startX + 2 * colWidth,
      headerY,
      startX + 2 * colWidth,
      headerY + headerHeight
    ); // After column 2

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

  const showModal = (record) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        date: dayjs(record.payment_date),
        description: record.description,
        received: parseFloat(record.received_amount),
        transaction: record.transaction,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRecord(null);
  };

  const onSubmit = async (values) => {
    const newData = {
      ...values,
      payment_date: values.date.format("YYYY-MM-DD"),
      received_amount: `${values.received.toString()} ${projectCurrency}`,
      project_id: id,
    };
    try {
      if (editingRecord) {
        const updatedRecord = await updateFinancialRecord(
          editingRecord.id,
          newData
        );
        const updatedRecords = financialRecords.map((record) =>
          record.id === editingRecord.id ? updatedRecord : record
        );
        setFinancialRecords(updatedRecords);
        message.success("Record updated successfully!");
      } else {
        const response = await createFinancialRecord(newData);
        if (response && response.id) {
          setFinancialRecords([...financialRecords, response]);
          setCurrentPage(Math.ceil((financialRecords.length + 1) / pageSize));
          message.success("Record saved successfully!");
        } else {
          message.error("Failed to save the new record. Please try again.");
        }
      }

      const newSubtotal =
        calculateSubtotal(financialRecords) +
        parseFloat(newData.received_amount);
      const balance = projectAmount - newSubtotal;
      const formattedBalance = `${balance.toFixed(2)} ${projectCurrency}`;

      console.log("Balance after update: ", formattedBalance);

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error saving record: ", error);
      message.error(
        "Failed to save record. Please check your input and try again."
      );
    }
  };

  const deleteRecord = async (id) => {
    try {
      await deleteFinancialRecord(id);
      const updatedRecords = financialRecords.filter(
        (record) => record.id !== id
      );
      setFinancialRecords(updatedRecords);
      message.success("Record deleted successfully!");
    } catch (error) {
      message.error("Failed to delete record.");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text) => <span>{dayjs(text).format("DD MMM YYYY")}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Received Amount",
      dataIndex: "received_amount",
      key: "received_amount",
      render: (text) =>
        `${parseFloat(text).toFixed(2) + " " + projectCurrency}`,
    },
    {
      title: "Transaction",
      dataIndex: "transaction",
      key: "transaction",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span className="flex space-x-4">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            className="hover:bg-blue-600"
          >
            Edit
          </Button>

          <Popconfirm
            title="Are you sure to delete this record?"
            onConfirm={() => deleteRecord(record.id)}
            okText="Yes"
            cancelText="No"
            icon={<DeleteOutlined style={{ color: "red" }} />}
          >
            <Button
              type="default"
              icon={<DeleteOutlined />}
              danger
              className="hover:bg-red-600"
            >
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  const showAllRecordsModal = () => {
    setIsRecordModalVisible(true);
  };

  const handleRecordModalCancel = () => {
    setIsRecordModalVisible(false);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=800,width=800");
    const printContent = document.getElementById("printModalContent").innerHTML;
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write(
      "<style>body { font-family: Arial, sans-serif; padding: 20px; }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  const navigate = useNavigate();

  if (!project) {
    return (
      <div className="flex justify-center mt-[50px] h-screen items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="md:py-5">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <HomeOutlined />
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <UserOutlined />
          <Link to="/client">Clients</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Flex
            gap={4}
            onClick={() => {
              navigate(-1);
            }}
            className="cursor-pointer "
          >
            <ProjectOutlined />
            <span className="hover:bg-slate-200 rounded-ms px-1">Projects</span>
          </Flex>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Flex gap={4}>
            <ProjectOutlined />
            {project.name}
          </Flex>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Card title={`Project: ${project.name}`} style={{ marginBottom: "20px" }}>
        <p>{project.details}</p>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-md rounded-lg flex flex-col items-center justify-center text-center bg-white p-4">
          <img
            src={moneyImg}
            alt=""
            width={40}
            height={40}
            className="mb-2 mx-auto"
          />
          <h3 className="text-blue-600 text-lg font-semibold">Budget</h3>
          <p className="text-lg">{`${
            parseFloat(project.budget).toFixed(2) + " " + projectCurrency || 0
          }`}</p>
        </Card>
        <Card className="shadow-md rounded-lg flex flex-col items-center text-center bg-white p-4">
          <img
            src={subtotalImg}
            alt=""
            width={40}
            height={40}
            className="mb-2 mx-auto"
          />
          <h3 className="text-green-600 text-lg font-semibold">Subtotal</h3>
          <p className="text-lg">{`${calculateSubtotal(
            financialRecords
          ).toFixed(2)} ${projectCurrency}`}</p>
        </Card>
        <Card className="shadow-md rounded-lg flex flex-col items-center text-center bg-white p-4">
          <img
            src={dueImg}
            alt=""
            width={40}
            height={40}
            className="mb-2 mx-auto"
          />
          <h3 className="text-red-600 text-lg font-semibold">Due Price</h3>
          <p className="text-lg">{`${calculateDuePrice().toFixed(
            2
          )} ${projectCurrency}`}</p>
        </Card>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Button
          onClick={() => showModal(null)}
          style={{ marginBottom: "10px", marginLeft: "10px" }}
        >
          Add New Record
        </Button>
        <Button
          onClick={showAllRecordsModal}
          style={{ marginBottom: "10px", marginLeft: "10px" }}
        >
          View Records
        </Button>
        <Button
          style={{ marginBottom: "10px", marginLeft: "10px" }}
          onClick={showStatusModal}
        >
          Update Project Status
        </Button>
        <Button
          style={{ marginBottom: "10px", marginLeft: "10px" }}
          onClick={generateInvoicePDF}
        >
          View Details
        </Button>
      </div>
      <Modal
        title="Update Project Status"
        visible={isStatusModalVisible}
        onCancel={handleStatusModalCancel}
        footer={[
          <Button key="cancel" onClick={handleStatusModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleStatusSubmit}
            loading={isSubmitting}
          >
            Submit
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Project Status">
            <Select value={newStatus} onChange={handleStatusChange}>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Ongoing">Ongoing</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
              <Select.Option value="Pause">Pause</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        dataSource={financialRecords}
        columns={columns}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          total: financialRecords.length,
          onChange: (page) => setCurrentPage(page),
        }}
        rowKey={(record) => record.id}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title="Project Financial Overview"
        visible={isRecordModalVisible}
        onCancel={handleRecordModalCancel}
        footer={[
          <div className="flex justify-between w-full space-x-2" key="footer">
            <Button
              key="print"
              icon={<PrinterOutlined />}
              onClick={generateInvoicePDF}
              type="primary"
              className="flex-1"
            >
              Print
            </Button>
            <Button
              key="close"
              onClick={handleRecordModalCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200"
            >
              Close
            </Button>
          </div>,
        ]}
        width="90%"
        style={{ maxWidth: "700px", padding: "16px" }}
        bodyStyle={{ padding: "8px 16px" }}
      >
        <div id="printModalContent" className="space-y-6">
          {/* Project Details Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Project Details
            </h3>
            <p>
              <strong>Project Name:</strong> {project.name}
            </p>
            <p>
              <strong>Concern Person:</strong> {client.name}
            </p>
            <p>
              <strong>Mobile Number:</strong> {client.phone}
            </p>
            <p>
              <strong>Project Created On:</strong>{" "}
              {dayjs(project.start_time).format("DD MMM YYYY")}
            </p>
          </div>

          <hr className="my-6 border-t border-gray-300" />

          {/* Payment Details Table with Infinite Scroll */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Payment Details
            </h3>
            <div
              className="overflow-auto"
              style={{
                maxHeight: "400px",
                scrollbarWidth: "none" /* Firefox */,
                msOverflowStyle: "none" /* Internet Explorer 10+ */,
              }}
            >
              <Table
                dataSource={financialRecords}
                rowKey="id"
                pagination={false} // Disable pagination, we will handle infinite scrolling
                scroll={{ y: 400, x: 300 }} // Enable vertical scroll and set a horizontal scroll
                onScroll={(e) => {
                  const bottom =
                    e.target.scrollHeight ===
                    e.target.scrollTop + e.target.clientHeight;
                  if (bottom && !isLoading) {
                    loadMore(); // Trigger load more function when scrolled to the bottom
                  }
                }}
                columns={[
                  {
                    title: "Payment Date",
                    dataIndex: "payment_date",
                    key: "payment_date",
                    render: (text) => (
                      <span className="font-semibold">{text}</span>
                    ),
                    // Make the column sticky at the top
                    sticky: "top",
                  },
                  {
                    title: "Description", // New column for description
                    dataIndex: "description",
                    key: "description",
                    render: (text) => <span>{text}</span>,
                    // Make the column sticky at the top
                    sticky: "top",
                  },
                  {
                    title: "Received Amount",
                    dataIndex: "received_amount",
                    key: "received_amount",
                    render: (text) => (
                      <span>
                        {parseFloat(text).toFixed(2)} {projectCurrency}
                      </span>
                    ),
                    // Make the column sticky at the top
                    sticky: "top",
                  },
                ]}
              />
            </div>
          </div>

          <hr className="my-6 border-t border-gray-300" />

          {/* Financial Summary Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Financial Summary
            </h3>
            <p>
              <strong>Total Amount:</strong>{" "}
              {`${projectAmount.toFixed(2)} ${projectCurrency}`}
            </p>
            <p>
              <strong>Subtotal (Received Amount):</strong>{" "}
              {`${calculateSubtotal(financialRecords).toFixed(
                2
              )} ${projectCurrency}`}
            </p>
            <p>
              <strong>Due Amount:</strong>{" "}
              {`${calculateDuePrice().toFixed(2)} ${projectCurrency}`}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        title={editingRecord ? "Edit Record" : "Add New Record"}
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select the date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter the description" },
            ]}
          >
            <Input placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="received"
            label="Received Amount"
            rules={[
              { required: true, message: "Please enter the received amount" },
            ]}
          >
            <InputNumber
              placeholder="Enter received amount"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="transaction"
            label="Transaction"
            rules={[
              { required: true, message: "Please enter the transaction type" },
            ]}
          >
            <Input placeholder="Enter transaction type" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            style={{ marginRight: "8px" }}
          >
            Submit
          </Button>
          <Button onClick={handleModalCancel}>Cancel</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;

// Project name
// Project Concern Person name
// concern person Mobile number
// Project created date
// Project Payment Details
// .........................
// ........................
// ........................
// Due
// Total Amount
