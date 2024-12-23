import { FolderOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../common/constants";

const { Title } = Typography;

const Header = ({ name ,setId,templateId,responseLogs,templateLogs}) =>{
  const navigate = useNavigate(); // Initialize the navigate function

const handleIconClick = () => {
  navigate(ROUTES.MAIN);
};
const handleSetClick=()=>{
  navigate(ROUTES.EDIT_ENTRIES.replace(':templateId', templateId).replace(':setId', setId));
}
const templogClick=()=>{
  navigate(ROUTES.REGISTER_TEMPLATE_VIEW.replace(':templateId', templateId));
}
const handleViewEntry = () => {

  navigate(ROUTES.VIEW_ENTRIES.replace(':templateId', templateId));
};
return(
  <div
  style={{
    position: "fixed", // Fixes the header to the top of the page
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // Ensures the header is above other content
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
      <Title
        level={5}
        style={{ margin: 0, marginRight: "10px", cursor: templateId ? "pointer" : "default" }}
        onClick={() => {

          if (templateId && templateLogs) {
            templogClick();
          } else if (templateId) {
            handleViewEntry(templateId);
          }
        }}
      >
        {name}
      </Title>
      {setId && (
        <>
          <span style={{ marginRight: "10px" }}>{"  > "}</span>
          <Title
        level={5}
        style={{ margin: 0, marginRight: "10px", cursor: templateId ? "pointer" : "default" }}
        onClick={() => responseLogs && handleSetClick()}
      >
           setId-{setId}
          </Title>
        </>
      )}
      {responseLogs && (
        <>
         <span style={{ marginRight: "10px" }}>{"  > "}</span>
          <Title level={5} style={{ margin: 0 }}>
           Change Logs
          </Title>
        </>
      )

      }
 {templateLogs && (
        <>
         <span style={{ marginRight: "10px" }}>{"  > "}</span>
          <Title level={5} style={{ margin: 0 }}>
            Change Logs
          </Title>
        </>
      )

      }

    </div>
  );
}
export default Header;
