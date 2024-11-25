import { FolderOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../common/constants";

const { Title } = Typography;

const Header = ({ name }) =>{
  const navigate = useNavigate(); // Initialize the navigate function

const handleIconClick = () => {
  // Navigate to the provided route when the folder icon is clicked
  navigate(ROUTES.MAIN);
};
return(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "20px 30px",
        borderBottom: "1px solid #ddd",
        background: "#f8f9fa",
      }}
    >


      {/* Folder Icon */}
      <FolderOutlined style={{ fontSize: "20px", color: "#fa541c", marginRight: "10px" }}
      onClick={handleIconClick} />
    <span style={{ marginRight: "10px" }}>{" > "}</span>
      {/* Name */}
      <Title level={5} style={{ margin: 0 }}>
        {name}
      </Title>
    </div>
  );
}
export default Header;
