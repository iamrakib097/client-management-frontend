import React, { useState } from "react";
import { Button, Modal, Form, Input, Select, DatePicker } from "antd";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ProjectDetailsModal = ({ project }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [projectStatus, setProjectStatus] = useState("");

  // This function will be triggered when the "Generate PDF" button is clicked
  const handleGeneratePDF = () => {
    // Get values from the modal form
    const { name, concernPerson, mobileNumber, createdDate, paymentDetails } =
      form.getFieldsValue();

    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Add project name
    doc.setFontSize(18);
    doc.text("Project Name: " + name, 10, 10);

    // Add concern person details
    doc.setFontSize(12);
    doc.text("Concern Person: " + concernPerson, 10, 20);
    doc.text("Mobile Number: " + mobileNumber, 10, 30);

    // Add project creation date
    doc.text(
      "Project Created Date: " + createdDate.format("YYYY-MM-DD"),
      10,
      40
    );

    // Add payment details
    doc.text("Payment Details:", 10, 50);
    doc.autoTable({
      head: [["Description", "Amount"]],
      body: paymentDetails.map((detail) => [detail.description, detail.amount]),
      startY: 60,
      margin: { horizontal: 10 },
    });

    // Add due and total amount
    const totalAmount = paymentDetails.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    doc.text(
      "Total Amount: " + totalAmount + " USD",
      10,
      doc.lastAutoTable.finalY + 10
    );
    doc.text(
      "Due: " + (project.budget - totalAmount) + " USD",
      10,
      doc.lastAutoTable.finalY + 20
    );

    // Open the generated PDF in a new window
    doc.output("dataurlnewwindow");
  };

  // Show Modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle Modal Cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        View Project Details
      </Button>

      <Modal
        title="Project Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="generate" type="primary" onClick={handleGeneratePDF}>
            Generate PDF
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Project Name"
            initialValue={project.name}
            rules={[
              { required: true, message: "Please enter the project name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="concernPerson"
            label="Concern Person"
            initialValue={project.concernPerson}
            rules={[
              { required: true, message: "Please enter the concern person!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="mobileNumber"
            label="Mobile Number"
            initialValue={project.mobileNumber}
            rules={[
              { required: true, message: "Please enter the mobile number!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="createdDate"
            label="Project Created Date"
            initialValue={project.createdDate}
            rules={[
              { required: true, message: "Please select the created date!" },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="paymentDetails"
            label="Payment Details"
            initialValue={project.paymentDetails}
            rules={[{ required: true, message: "Please add payment details!" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select payment details"
              options={project.paymentDetails.map((detail) => ({
                value: detail.id,
                label: detail.description,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetailsModal;
