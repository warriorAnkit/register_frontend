// FieldIcon.js
import React from 'react';
import { FontSizeOutlined,CheckSquareOutlined,PaperClipOutlined,NumberOutlined,FileTextOutlined, CheckCircleOutlined, CalculatorOutlined, CalendarOutlined} from '@ant-design/icons';

const FieldIcon = ({ fieldType }) => {
  const iconMap = {
    TEXT: <FontSizeOutlined />,
    MULTI_LINE_TEXT: <FileTextOutlined />,
    OPTIONS: <CheckCircleOutlined />,
    CHECKBOXES: <CheckSquareOutlined />,
    NUMERIC: <NumberOutlined />,
    DATE_PICKER: <CalendarOutlined />,
    ATTACHMENT: <PaperClipOutlined />,
    CALCULATION: <CalculatorOutlined />,
  };

  return iconMap[fieldType] || null; // Return icon for the given fieldType
};

export default FieldIcon;

// const Icons = {
//   TEXT: <FontSizeOutlined />,
//   MULTI_LINE_TEXT: <AlignLeftOutlined />,
//   OPTIONS: <DotChartOutlined className="radio-icon" />,
//   CHECKBOXES: <CheckSquareOutlined />,
//   NUMERIC: <NumberOutlined />,
//   DATE: <CalendarOutlined />,
//   ATTACHMENT: <PaperClipOutlined />,
//   CALCULATION: <CalculatorOutlined />,
// };
