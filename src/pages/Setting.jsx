import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Button, Table, Modal, message, Breadcrumb } from "antd";
import {
  DeleteFilled,
  EditFilled,
  HomeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import api from "../ulits/api";
const Setting = () => {
  const [settings, setSettings] = useState([]);
  const [clientSettings, setClientSettings] = useState([]);
  const [projectSettings, setProjectSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCurrency, setNewCurrency] = useState("");
  const [newClientStatus, setNewClientStatus] = useState("");
  const [newProjectType, setNewProjectType] = useState("");
  const [editId, setEditId] = useState(null);
  const [editCurrency, setEditCurrency] = useState("");
  const [editClientStatus, setEditClientStatus] = useState("");
  const [editProjectType, setEditProjectType] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedSettingType, setSelectedSettingType] = useState("");
  const [selectedSettingId, setSelectedSettingId] = useState(null);

  // Fetch data from the API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/currency-settings/");
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchClientSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/client-settings/");
      setClientSettings(response.data);
    } catch (error) {
      console.error("Error fetching client settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/project-settings/");
      setProjectSettings(response.data);
    } catch (error) {
      console.error("Error fetching project settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchClientSettings();
    fetchProjectSettings();
  }, []);

  // Add new setting logic
  const handleAddCurrency = async () => {
    if (newCurrency.trim() === "") {
      message.warning("Currency cannot be empty");
      return;
    }
    try {
      const response = await api.post("/currency-setting/", {
        currency: newCurrency,
      });
      setSettings([...settings, response.data]);
      setNewCurrency("");
      message.success("Currency added successfully");
    } catch (error) {
      console.error("Error adding currency:", error);
      message.error("Failed to add currency");
    }
  };

  const handleAddClientStatus = async () => {
    if (newClientStatus.trim() === "") {
      message.warning("Client status cannot be empty");
      return;
    }
    try {
      const response = await api.post("/client-setting/", {
        client_status: newClientStatus,
      });
      setClientSettings([...clientSettings, response.data]);
      setNewClientStatus("");
      message.success("Client status added successfully");
    } catch (error) {
      console.error("Error adding client status:", error);
      message.error("Failed to add client status");
    }
  };

  const handleAddProjectType = async () => {
    if (newProjectType.trim() === "") {
      message.warning("Project type cannot be empty");
      return;
    }
    try {
      const response = await api.post("/project-setting", {
        project_type: newProjectType,
      });
      setProjectSettings([...projectSettings, response.data]);
      setNewProjectType("");
      message.success("Project type added successfully");
    } catch (error) {
      console.error("Error adding project type:", error);
      message.error("Failed to add project type");
    }
  };

  // Edit Logic for each setting type
  const openEditModal = (id, type, value) => {
    setEditId(id);
    setSelectedSettingType(type);
    if (type === "currency") {
      setEditCurrency(value);
    } else if (type === "clientStatus") {
      setEditClientStatus(value);
    } else if (type === "projectType") {
      setEditProjectType(value);
    }
    setIsEditModalVisible(true);
  };

  const handleEdit = async () => {
    if (selectedSettingType === "currency" && editCurrency.trim()) {
      try {
        const response = await api.put(
          `/currency-setting/${editId}/`,
          { currency: editCurrency }
        );
  
        setSettings(
          settings.map((item) => (item.id === editId ? response.data : item))
        );
        setIsEditModalVisible(false);
        message.success("Currency updated successfully");
      } catch (error) {
        console.error("Error editing currency:", error);
        message.error("Failed to update currency");
      }
    } else if (selectedSettingType === "clientStatus" && editClientStatus.trim()) {
      try {
        const response = await api.put(
          `/client-setting/${editId}/`,
          { client_status: editClientStatus }
        );
  
        setClientSettings(
          clientSettings.map((item) =>
            item.id === editId ? response.data : item
          )
        );
        setIsEditModalVisible(false);
        message.success("Client status updated successfully");
      } catch (error) {
        console.error("Error editing client status:", error);
        message.error("Failed to update client status");
      }
    } else if (selectedSettingType === "projectType" && editProjectType.trim()) {
      try {
        const response = await api.put(
          `/project-setting/${editId}/`,
          { project_type: editProjectType }
        );
  
        setProjectSettings(
          projectSettings.map((item) =>
            item.id === editId ? response.data : item
          )
        );
        setIsEditModalVisible(false);
        message.success("Project type updated successfully");
      } catch (error) {
        console.error("Error editing project type:", error);
        message.error("Failed to update project type");
      }
    } else {
      message.warning("Please enter a valid value before submitting");
    }
  };

  // Delete Logic for each setting type
  const openDeleteModal = (id, type) => {
    setSelectedSettingId(id);
    setSelectedSettingType(type);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      if (selectedSettingType === "currency") {
        await api.delete(`/currency-setting/${selectedSettingId}/`);
        setSettings(settings.filter((item) => item.id !== selectedSettingId));
      } else if (selectedSettingType === "clientStatus") {
        await api.delete(`/client-setting/${selectedSettingId}/`);
        setClientSettings(
          clientSettings.filter((item) => item.id !== selectedSettingId)
        );
      } else if (selectedSettingType === "projectType") {
        await api.delete(`/project-setting/${selectedSettingId}/`);
        setProjectSettings(
          projectSettings.filter((item) => item.id !== selectedSettingId)
        );
      }
      setIsDeleteModalVisible(false);
      message.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      message.error("Failed to delete item");
    }
  };
  // Table columns for Ant Design table
  const columns = [
    {
      title: "Index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
      align: "center",
      width: "150px",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <>
          <div className="flex items-center justify-center">
            <Button
              onClick={() =>
                openEditModal(record.id, "currency", record.currency)
              }
              className="bg-blue-500 text-white hover:bg-blue-600 px-2 py-2 rounded"
            >
              <EditFilled />
            </Button>

            <Button
              onClick={() => openDeleteModal(record.id, "currency")}
              style={{ marginLeft: 8 }}
              className="bg-red-500 text-white hover:bg-red-600 px-2 py-2 rounded"
            >
              <DeleteFilled />
            </Button>
          </div>
        </>
      ),
    },
  ];

  const clientColumns = [
    {
      title: "Index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Client Status",
      dataIndex: "client_status",
      key: "client_status",
      align: "center",
      width: "150px",
      render: (text) => (
        <div
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            onClick={() =>
              openEditModal(record.id, "clientStatus", record.client_status)
            }
            className="bg-blue-500 text-white hover:bg-blue-600 px-2 py-2 rounded"
          >
            <EditFilled />
          </Button>

          <Button
            onClick={() => openDeleteModal(record.id, "clientStatus")}
            style={{ marginLeft: 8 }}
            className="bg-red-500 text-white hover:bg-red-600 px-2 py-2 rounded"
          >
            <DeleteFilled />
          </Button>
        </>
      ),
    },
  ];

  const projectColumns = [
    {
      title: "Index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Project Type",
      dataIndex: "project_type",
      key: "project_type",
      align: "center",
      width: "150px",
      render: (text) => (
        <div
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <>
          <Button
            onClick={() =>
              openEditModal(record.id, "projectType", record.project_type)
            }
            className="bg-blue-500 text-white hover:bg-blue-600 px-2 py-2 rounded"
          >
            <EditFilled />
          </Button>

          <Button
            onClick={() => openDeleteModal(record.id, "projectType")}
            style={{ marginLeft: 8 }}
            className="bg-red-500 text-white hover:bg-red-600 px-2 py-2 rounded"
          >
            <DeleteFilled />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="  py-6">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <HomeOutlined />
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <SettingOutlined />
          <span>Settings</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-xl font-semibold mb-6 mt-6">Settings</h2>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 sm:w-full lg:w-1/3">
          <div className="mb-4">
            <Input
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value)}
              placeholder="Add new currency"
              className="w-full"
            />
            <Button
              type="primary"
              onClick={handleAddCurrency}
              className="mt-2 w-full sm:w-auto"
            >
              Add Currency
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={settings}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: true }}
            style={{ marginTop: 16 }}
            className="max-w-full overflow-hidden"
          />
        </div>

        {/* Client Settings Table */}
        <div className="flex-1 sm:w-full lg:w-1/3">
          <div className="mb-4">
            <Input
              value={newClientStatus}
              onChange={(e) => setNewClientStatus(e.target.value)}
              placeholder="Add new client status"
              className="w-full"
            />
            <Button
              type="primary"
              onClick={handleAddClientStatus}
              className="mt-2 w-full sm:w-auto"
            >
              Add Client Status
            </Button>
          </div>
          <Table
            columns={clientColumns}
            dataSource={clientSettings}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: true }}
            style={{ marginTop: 16 }}
            className="max-w-full overflow-hidden"
          />
        </div>

        <div className="flex-1 sm:w-full lg:w-1/3">
          <div className="mb-4">
            <Input
              value={newProjectType}
              onChange={(e) => setNewProjectType(e.target.value)}
              placeholder="Add new project type"
              className="w-full"
            />
            <Button
              type="primary"
              onClick={handleAddProjectType}
              className="mt-2 w-full sm:w-auto"
            >
              Add Project Type
            </Button>
          </div>
          <Table
            columns={projectColumns}
            dataSource={projectSettings}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: true }}
            style={{ marginTop: 16 }}
            className="max-w-full overflow-hidden"
          />
        </div>
      </div>

      <Modal
        title={`Edit ${selectedSettingType}`}
        visible={isEditModalVisible}
        onOk={handleEdit}
        onCancel={() => setIsEditModalVisible(false)}
        className="w-full sm:w-96"
      >
        <Input
          value={
            selectedSettingType === "currency"
              ? editCurrency
              : selectedSettingType === "clientStatus"
              ? editClientStatus
              : editProjectType
          }
          onChange={(e) =>
            selectedSettingType === "currency"
              ? setEditCurrency(e.target.value)
              : selectedSettingType === "clientStatus"
              ? setEditClientStatus(e.target.value)
              : setEditProjectType(e.target.value)
          }
          placeholder={`Edit ${selectedSettingType}`}
        />
      </Modal>

      <Modal
        title={`Delete ${selectedSettingType}`}
        visible={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        className="w-full sm:w-96"
      >
        <p>Are you sure you want to delete this {selectedSettingType}?</p>
      </Modal>
    </div>
  );
};

export default Setting;
