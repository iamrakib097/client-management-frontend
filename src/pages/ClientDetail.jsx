import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  List,
  Modal,
  Input,
  Form,
  message,
  DatePicker,
  Select,
  Row,
  Col,
  Descriptions,
  Breadcrumb,
  Flex,
  Spin,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { CgPassword } from "react-icons/cg";
import api from "../ulits/api";

const fetchClientById = async (id) => {
  const response = await api.get(`/client/${id}/`);
  return response.data;
};

const fetchAllProjects = async () => {
  const response = await api.get(`/projects`);
  return response.data;
};

const fetchAllCurrency = async () => {
  const response = await api.get(`/currency-settings`);
  return response.data;
};

const createProject = async (projectData) => {
  try {
    const response = await api.post("/project/", projectData);
    return response.data; 
  } catch (error) {
    console.error("Error creating project:", error.response ? error.response.data : error.message);
    throw new Error("Failed to create project");
  }
};

const updateClient = async (id, updatedClient) => {
  try {
    const response = await api.put(`/client/${id}`, updatedClient);
    return response.data;
  } catch (error) {
    console.error("Error updating client:", error.response ? error.response.data : error.message);
    throw new Error("Failed to update client");
  }
};

const ClientDetail = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currency, setCurrency] = useState([]);
  const [projectTypeOption, setProjectTypeOption] = useState([]);
  const [clientStatus, setClientStatus] = useState("");
  const [clientStatusOptions, setClientStatusOptions] = useState([]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  useEffect(() => {
    const getClientAndProjects = async () => {
      try {
        const clientData = await fetchClientById(id);
        setClient(clientData);
        setClientStatus(clientData.status); // Set the initial client status here
        const currencyData = await fetchAllCurrency();
        setCurrency(currencyData.map((value) => value.currency));

        const allProjects = await fetchAllProjects();
        const filteredProjects = allProjects.filter(
          (project) => project.client_id === clientData.id
        );
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching client and projects:", error);
      }
    };
    getClientAndProjects();
  }, [id]);

  useEffect(() => {
    const fetchClientStatusOptions = async () => {
      try {
        const response = await api.get("/client-settings/");
        setClientStatusOptions(response.data); // Update status options
      } catch (error) {
        console.error("Error fetching client status options:", error.response ? error.response.data : error.message);
        message.error("Failed to load client status options.");
      }
    };
  
    fetchClientStatusOptions();
  }, []);

  useEffect(() => {
    const fetchProjectType = async () => {
      try {
        const response = await api.get("/project-settings/");
        setProjectTypeOption(response.data);
      } catch (error) {
        console.error("Error fetching project type options:", error.response ? error.response.data : error.message);
        message.error("Failed to load project type options.");
      }
    };
  
    fetchProjectType();
  }, []);

  const handleCreateProject = async (values) => {
    console.log("Form values:", values); // Debugging the form values
    const newProject = {
      name: values.name,
      details: values.description,
      budget: `${values.totalPrice} ${values.currency}`,
      sub_total: `0 ${values.currency}`,
      start_time: formatDate(values.start_time), // Safely formatting the start time
      end_time: formatDate(values.end_time), // Safely formatting the end time
      status: values.status,
      project_type: values.project_type,
      client_id: id,
    };
    console.log(newProject);

    try {
      const createdProject = await createProject(newProject);
      const updatedClient = {
        ...client,
        projects: Array.isArray(client.projects)
          ? [...client.projects, createdProject.id]
          : [createdProject.id],
      };

      await updateClient(id, updatedClient);
      setProjects([...projects, createdProject]);
      setClient(updatedClient);
      setIsModalVisible(false);
      form.resetFields();
      message.success("Project created successfully!");
    } catch (error) {
      message.error("Failed to create project.");
      console.error("Error creating project:", error);
    }
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleStatusChange = async (newStatus) => {
    const updatedClient = { ...client, status: newStatus };
    try {
      await updateClient(id, updatedClient);
      setClient(updatedClient); // Update client status locally
      setClientStatus(newStatus); // Update the status dropdown
      message.success("Client status updated successfully!");
    } catch (error) {
      message.error("Failed to update client status.");
      console.error("Error updating client status:", error);
    }
  };

  if (!client) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className=" md:py-5">
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
          <Flex className="gap-2">
            <UserOutlined />
            {client.name}
          </Flex>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <h4 className="text-[16px] font-semibold pb-5">Client Details</h4>
        <Descriptions
          bordered
          column={{ xs: 1, md: 2, lg: 2, xl: 3 }}
          className="w-full"
        >
          <Descriptions.Item label="Name">
            <div className="flex items-center gap-2 font-semibold">
              <UserOutlined />
              {client.name}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <div className="flex items-center gap-2 font-semibold">
              <MailOutlined /> {client.email}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            <div className="flex items-center gap-2 font-semibold">
              <PhoneOutlined /> {client.phone}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            <div className="flex items-center gap-2 font-semibold">
              <HomeOutlined /> {client.address}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Client Status">
            <div className="flex items-center w-full gap-2 font-semibold">
              <Select
                value={clientStatus}
                onChange={handleStatusChange}
                placeholder="Select client status"
                className="w-full" // Ensures the Select takes up full width
                dropdownStyle={{ width: "auto" }} // Ensures the dropdown doesn't have width constraints
              >
                {clientStatusOptions.map((status) => (
                  <Select.Option key={status.id} value={status.client_status}>
                    {status.client_status}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Password">
            <div className="flex items-center gap-2 font-semibold">
              <CgPassword /> {client.password}
            </div>
          </Descriptions.Item>
        </Descriptions>
        <h4 className="text-[16px] font-semibold pt-5">Projects</h4>

        <List
          itemLayout="horizontal"
          dataSource={projects}
          className="py-4"
          renderItem={(project) => (
            <List.Item>
              <List.Item.Meta
                className="md:pr-[100px] pr-[20px]"
                title={
                  <Link
                    to={`/projects/${project.id}`}
                    className="font-semibold"
                  >
                    Project Name: {project.name}
                  </Link>
                }
                description={
                  project.details.length > 100
                    ? `${project.details.substring(0, 70)}...`
                    : project.details
                }
              />
              <Link to={`/projects/${project.id}`}>
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                  View Project
                </button>
              </Link>
            </List.Item>
          )}
        />

        <button
          className="bg-blue-500 text-white py-2 px-4 mt-5 rounded w-full hover:bg-blue-600"
          onClick={showModal}
        >
          Create New Project
        </button>
      </Card>

      <Modal
        title="Create New Project"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateProject} layout="vertical">
          <Form.Item
            label="Project Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the project name" },
            ]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>
          {/* Project Type Field */}
          <Form.Item
            label="Project Type"
            name="project_type"
            rules={[{ required: true, message: "Project type is required" }]}
          >
            <Select placeholder="Select Project Type">
              {projectTypeOption.map((data) => (
                <Select.Option key={data.id} value={data.project_type}>
                  {data.project_type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the description" },
            ]}
          >
            <Input.TextArea placeholder="Enter project description" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item
              label="Budget"
              name="totalPrice"
              rules={[{ required: true }]}
            >
              <Input placeholder="Budget" type="number" />
            </Form.Item>

            <Form.Item
              label="Currency"
              name="currency"
              rules={[{ required: true }]}
            >
              <Select placeholder="Currency">
                {currency.map((code) => (
                  <Select.Option key={code} value={code}>
                    {code}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select placeholder="Status">
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Ongoing">Ongoing</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
              <Select.Option value="Pause">Pause</Select.Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item
              label="Start Date"
              name="start_time"
              rules={[{ required: true }]}
            >
              <DatePicker placeholder="Select start date" className="w-full" />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="end_time"
              rules={[{ required: true }]}
            >
              <DatePicker placeholder="Select end date" className="w-full" />
            </Form.Item>
          </div>

          <button
            className="bg-blue-500 text-white py-2 px-4 w-full rounded hover:bg-blue-600"
            type="submit"
          >
            Create Project
          </button>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientDetail;
