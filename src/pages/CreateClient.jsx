import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Input,
  Button,
  Form,
  Card,
  notification,
  Breadcrumb,
  message,
  Select,
} from "antd";
import { HomeOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../ulits/api";
const CreateClient = () => {
  const [clientStatusOptions, setClientStatusOptions] = useState([]);
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();
  // Fetch client status options
  useEffect(() => {
    const fetchClientStatus = async () => {
      try {
        const response = await api.get("/client-settings/");
        setClientStatusOptions(response.data);
      } catch (error) {
        console.error("Error fetching client status options:", error);

        if (error.response) {
          message.error(
            error.response.data.message ||
              "Failed to load client status options."
          );
        } else if (error.request) {
          message.error("No response received from the server.");
        } else {
          message.error(
            "An error occurred while fetching client status options."
          );
        }
      }
    };

    fetchClientStatus();
  }, []);

  const onSubmit = async (data) => {
    console.log("Form Data: ", data);

    // Serialize the form data
    const serializedData = {
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: data.password,
      status: data.status,
    };

    try {
      const response = await api.post("/client/", serializedData);

      console.log("Client created successfully", response.data);

      message.success("The client has been created successfully!");
      reset();
      navigate("/client");
    } catch (error) {
      console.error("Error creating client:", error);

      if (error.response) {
        console.error("Server Error:", error.response.data);
        message.error(error.response.data.message || "Error Creating Client");
      } else if (error.request) {
        console.error("Request Error:", error.request);
        message.error("No response from the server.");
      } else {
        console.error("Unexpected Error:", error.message);
        message.error("An unexpected error occurred.");
      }
    }
  };
  return (
    <section className="py-5">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <HomeOutlined />
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <UserAddOutlined />
          <Link to="/create-client">Create-clients</Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Card
        title="Create Client"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <Form.Item label="Name" required>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <div>
                  <Input {...field} placeholder="Enter your name" />
                  {errors.name && (
                    <p style={{ color: "red" }}>{errors.name.message}</p>
                  )}
                </div>
              )}
            />
          </Form.Item>
          {/* Status Field */}
          <Form.Item label="Status" required>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Client status is required" }}
              render={({ field }) => (
                <div>
                  <Select {...field} placeholder="Select client status">
                    {clientStatusOptions.map((status) => (
                      <Select.Option
                        key={status.id}
                        value={status.client_status}
                      >
                        {status.client_status}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.status && (
                    <p style={{ color: "red" }}>{errors.status.message}</p>
                  )}
                </div>
              )}
            />
          </Form.Item>

          {/* Company Field */}
          <Form.Item label="Company" required>
            <Controller
              name="company"
              control={control}
              rules={{ required: "Company is required" }}
              render={({ field }) => (
                <div>
                  <Input {...field} placeholder="Enter your company" />
                  {errors.company && (
                    <p style={{ color: "red" }}>{errors.company.message}</p>
                  )}
                </div>
              )}
            />
          </Form.Item>

          {/* Email Field */}
          <Form.Item label="Email" required>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                  message: "Enter a valid email",
                },
              }}
              render={({ field }) => (
                <div>
                  <Input {...field} placeholder="Enter your email" />
                  {errors.email && (
                    <p style={{ color: "red" }}>{errors.email.message}</p>
                  )}
                </div>
              )}
            />
          </Form.Item>

          {/* Phone Field */}
          <Form.Item label="Phone" required>
            <Controller
              name="phone"
              control={control}
              rules={{ required: "Phone number is required" }}
              render={({ field }) => (
                <div>
                  <Input {...field} placeholder="Enter your phone" />
                  {errors.phone && (
                    <p style={{ color: "red" }}>{errors.phone.message}</p>
                  )}
                </div>
              )}
            />
          </Form.Item>

          {/* Address Field */}
          <Form.Item label="Address" required>
            <Controller
              name="address"
              control={control}
              rules={{ required: "Address is required" }}
              render={({ field }) => (
                <div>
                  <Input.TextArea {...field} placeholder="Enter your address" />
                  {errors.address && (
                    <p style={{ color: "red" }}>{errors.address.message}</p>
                  )}
                </div>
              )}
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item label="Password" required>
            <Controller
              name="password"
              control={control}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field }) => (
                <div>
                  <Input.Password
                    {...field}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p style={{ color: "red" }}>{errors.password.message}</p>
                  )}
                </div>
              )}
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Client
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </section>
  );
};

export default CreateClient;
