/* eslint-disable react/destructuring-assignment */
import { Table, version } from "antd";
import React from "react";
import ReactDOM from "react-dom";
import ReactDragListView from "react-drag-listview";

// DraggableTable component definition
export class DraggableTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      columns: [
        {
          title: "Key",
          dataIndex: "key",
          fixed: true,
        },
        {
          title: "Name",
          dataIndex: "name",
        },
        {
          title: "Gender",
          dataIndex: "gender",
        },
        {
          title: "Age",
          dataIndex: "age",
        },
        {
          title: "Address",
          dataIndex: "address",
        },
      ],
    };

    this.dragProps = {
      onDragEnd: (fromIndex, toIndex) => {
        // eslint-disable-next-line react/no-access-state-in-setstate
        const columns = [...this.state.columns]; // Copy the columns array
        const item = columns.splice(fromIndex, 1)[0]; // Remove the dragged column
        columns.splice(toIndex, 0, item); // Insert the column at the new position
        this.setState({
          columns, // Update the columns state with the new order
        });
      },
      nodeSelector: "th", // Dragging happens on <th> elements
    };
  }

  render() {
    return (
      <div style={{ margin: 20 }}>
        <h2>Table column with dragging</h2>
        <ReactDragListView.DragColumn {...this.dragProps}>
          <Table
            columns={this.state.columns} // Dynamically render columns based on state
            pagination={false}
            dataSource={[]}
            bordered
            scroll={{ x: 800 }}
          />
        </ReactDragListView.DragColumn>
      </div>
    );
  }
}

// Default export for use in other files
export default DraggableTable;
