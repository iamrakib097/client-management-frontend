import React from "react";
import { Button, Row, Col, Typography } from "antd";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";

const Footer = () => (
  <div className="bg-[#1F1F1F] py-10 px-5">
    <Row justify="center" gutter={[16, 16]}>
      <Col>
        <Button
          type="link"
          icon={<FacebookOutlined />}
          className="bg-[#7e7a7a] hover:bg-[#F15A29] text-white hover:text-[#fffffe] rounded-full p-2"
          href="https://www.facebook.com/rafusoft"
          size="large"
        />
      </Col>
      <Col>
        <Button
          type="link"
          icon={<TwitterOutlined />}
          className="bg-[#7e7a7a] hover:bg-[#F15A29] text-white hover:text-[#fffffe] rounded-full p-2"
          href="https://twitter.com/rafusoft"
          size="large"
        />
      </Col>
      <Col>
        <Button
          type="link"
          icon={<InstagramOutlined />}
          className="bg-[#7e7a7a] hover:bg-[#F15A29] text-white hover:text-[#fffffe] rounded-full p-2"
          href="https://www.instagram.com/rafusoft"
          size="large"
        />
      </Col>
      <Col>
        <Button
          type="link"
          icon={<YoutubeOutlined />}
          className="bg-[#7e7a7a] hover:bg-[#F15A29] text-white hover:text-[#fffffe] rounded-full p-2"
          href="https://www.youtube.com/rafusoft"
          size="large"
        />
      </Col>
      <Col>
        <Button
          type="link"
          icon={<LinkedinOutlined />}
          className="bg-[#7e7a7a] hover:bg-[#F15A29] text-white hover:text-[#fffffe] rounded-full p-2"
          href="https://www.linkedin.com/in/rafusoft/"
          size="large"
        />
      </Col>
    </Row>

    <div className="text-center my-4">
      <a
        href="https://rafusoft.com/top-most-software-company-in-bangladesh"
        className="text-white hover:text-[#F15A29]"
      >
        Top Most Software Company in Bangladesh
      </a>
    </div>
    <div className="text-center my-4">
      <a
        href="https://rafusoft.com/software-company-in-bangladesh"
        className="text-white hover:text-[#F15A29]"
      >
        সফটওয়্যার কোম্পানি বাংলাদেশ
      </a>
    </div>

    <div className="flex justify-center">
      <a href="https://g.page/r/CV46CyoD9xEVEB0/review"></a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://maps.app.goo.gl/o78NzK3CyHwFKx8dA"
        className="ml-2"
      >
        <img
          width="180px"
          src="https://rafusoft.com/assets/img/stats/rafusoft-review.svg"
          alt="Rafusoft review"
        />
      </a>
    </div>

    <div className="facebook-like-button text-center mb-2 flex justify-center mt-10">
      <iframe
        src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Frafusoft&amp;width=174&amp;layout=button_count&amp;action=like&amp;size=large&amp;share=true&amp;height=46&amp;appId=951450788914496"
        width="174"
        height="30"
        scrolling="no"
        frameBorder="0"
        allowFullScreen="true"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      ></iframe>
    </div>

    <div className="flex justify-center flex-wrap items-center text-sm gap-2 mt-5">
      <a
        href="https://rafusoft.com/privacy-policy"
        target="_blank"
        className="text-[#F15A29] hover:text-white"
      >
        Privacy Policy
      </a>
      <span className="text-white">|</span>
      <a
        href="https://rafusoft.com/terms-and-conditions"
        target="_blank"
        className="text-[#F15A29] hover:text-white"
      >
        Terms & Conditions
      </a>
      <span className="text-white">|</span>
      <a
        href="https://rafusoft.com/refund-policy"
        target="_blank"
        className="text-[#F15A29] hover:text-white"
      >
        Refund Policy
      </a>
      <span className="text-white">|</span>
      <span className="text-white">
        © 2024 Rafusoft.com | Trade License: 525
      </span>
      <span className="text-white">|</span>
      <a
        href="https://basis.org.bd/company-profile/18-12-992"
        target="_blank"
        className="text-[#F15A29] hover:text-white"
      >
        Basis License: G992
      </a>
    </div>
  </div>
);

export default Footer;
