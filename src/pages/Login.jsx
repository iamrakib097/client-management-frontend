import React, { useState } from "react";
import { Form, Input, Button, Row, Col, Image } from "antd";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onFinish = () => {
    onLogin(email, password);
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100">
      <Row justify="center" align="middle" style={{ width: "100%" }}>
        <Col
          xs={22}
          sm={16}
          md={12}
          lg={8}
          xl={6}
          className="bg-white shadow-md rounded-lg px-6 py-10"
        >
          <div className="flex justify-center mb-4">
            <Image
              src="https://rafusoft.com/assets/img/rafusoft-logo.svg"
              alt="Rafusoft Logo"
              width={180}
            />
          </div>

          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please input a valid email!" },
              ]}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="py-2 px-4 rounded-sm border"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="py-2 px-4 rounded-sm border"
              />
            </Form.Item>

            <Form.Item>
              <button
                type="submit"
                className="bg-orange-600 text-white py-3 px-6 rounded-lg w-full text-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                Login
              </button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </section>
  );
};

export default Login;
