/* eslint-disable no-console */
import { FolderOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Typography, Modal, Popover } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../common/constants";
import SetDetailsCard from "./SetDetailsCard";

const { Title } = Typography;

const Header = ({ name ,setId,templateId,responseLogs,templateLogs,fillSet,location,setData,editTemplate,isAllRowsComplete}) =>{
  const navigate = useNavigate(); // Initialize the navigate function
  const [isModalOpen,setIsModalOpen]=useState(false);
// eslint-disable-next-line no-console
let isFillTablePage = false;
console.log(templateId,templateLogs);
if(isAllRowsComplete!==undefined){
 isFillTablePage = !(isAllRowsComplete);
}
const createRegisterPage = location?.includes("new-register");
const handleIconClick = () => {
  if (isFillTablePage||editTemplate||createRegisterPage||fillSet) {
    // Show a confirmation modal before navigation
    if(isModalOpen){
      return;
    }
    setIsModalOpen(true);
    Modal.confirm({
      title: "Unsaved Changes",
      content: "You may have unsaved changes. Do you want to navigate away?",
      onOk: () => {
        setIsModalOpen(false);
        navigate(ROUTES.MAIN);

      },
      onCancel: () => {
        setIsModalOpen(false);
      },
    });
  } else {
    navigate(ROUTES.MAIN);
  }
};
const handleSetClick=()=>{
  navigate(ROUTES.FILL_TABLE.replace(':templateId', templateId).replace(':setId', setId));
}
const templogClick=()=>{
  navigate(ROUTES.REGISTER_TEMPLATE_VIEW.replace(':templateId', templateId));
}
const handleViewEntry = () => {
  if (isFillTablePage) {
    // Show a confirmation modal before navigation
    Modal.confirm({
      title: "Unsaved Changes",
      content: "You have unsaved changes. Do you want to navigate away?",
      onOk: () => {
        navigate(ROUTES.VIEW_ENTRIES.replace(':templateId', templateId));
      },
      onCancel: () => {
        // Do nothing if the user cancels
      },
    });
  } else {
    navigate(ROUTES.VIEW_ENTRIES.replace(':templateId', templateId));
  }
};
return(
  <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
      {fillSet && (
        <>
          <span style={{ marginRight: "10px" }}>{"  > "}</span>
          <Title
        level={5}
        style={{ margin: 0, marginRight: "10px", cursor: templateId ? "pointer" : "default" }}
        onClick={() => responseLogs && handleSetClick()}
      >
           Create Set
          </Title>
        </>
      )}
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
          {setData && (
          <Popover
            content={<SetDetailsCard setData={setData} />}
            overlayStyle={{ padding: 0 ,margin: 0}}
          >
            <InfoCircleOutlined style={{color: "#1890ff", cursor: "pointer" }} />
          </Popover>
          )}
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
