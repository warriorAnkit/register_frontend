import { MenuOutlined } from '@ant-design/icons';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Table } from 'antd';
import React, { useState } from 'react';

const DraggableTable = () => {
  const columns = [
    {
      key: 'dragHandle',
      dataIndex: 'dragHandle',
      title: 'Drag',
      width: 30,
      render: () => <MenuOutlined className="grab" />,
    },
    {
      key: 'key',
      dataIndex: 'key',
      title: 'Key',
    },
  ];

  const dataSourceRaw = new Array(5)?.fill({})?.map((item, index) => ({
    // This will be transformed into `data-row-key` of props.
    // Shall be truthy to be draggable. I don't know why.
    // To this end, index of number type is converted into string.
    key: index?.toString(),
  }));
  const [dataSource, setDataSource] = useState(dataSourceRaw);
  // ID to render overlay.
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active?.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active?.id !== over?.id) {
      setDataSource((items) => {
        // In this example, find an item, where `item.key` === `useSortable.id`.
        const oldIndex = items?.findIndex((item) => item?.key === active?.id);
        const newIndex = items?.findIndex((item) => item?.key === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    // Stop overlay.
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={(item) => item?.key}
        components={{
          body: {
            wrapper: DraggableWrapper,
            row: DraggableRow,
          },
        }}
      />
      {/* Render overlay component. */}
      <DragOverlay>
        <Table
          columns={columns}
          showHeader={false}
          dataSource={
            activeId
              ? new Array(1)?.fill(
                  dataSource?.[
                    dataSource?.findIndex((item) => item?.key === activeId)
                  ],
                )
              : []
          }
          pagination={false}
        />
      </DragOverlay>
    </DndContext>
  );

  function DraggableWrapper(props) {
    const { children, ...restProps } = props;
    /**
     * 'children[1]` is `dataSource`
     * Check if `children[1]` is an array
     * because antd gives 'No Data' element when `dataSource` is an empty array
     */
    return (
      <SortableContext
        items={
          children?.[1] instanceof Array
            ? children?.[1]?.map((child) => child?.key)
            : []
        }
        strategy={verticalListSortingStrategy}
        {...restProps}
      >
        <tbody {...restProps}>
          {
            // This invokes `Table.components.body.row` for each element of `children`.
            children
          }
        </tbody>
      </SortableContext>
    );
  }

  function DraggableRow(props) {
    const {
      attributes,
      listeners,
      setNodeRef,
      isDragging,
      overIndex,
      index,
    } = useSortable({
      // eslint-disable-next-line react/destructuring-assignment
      id: props?.['data-row-key'],
    });
    const isOver = overIndex === index;
    const { children, ...restProps } = props;
    const isData = children instanceof Array;
    const style = {
      ...restProps?.style,
      ...(isData && isDragging ? { background: '#80808038' } : {}),
      ...(isData && isOver ? { borderTop: '5px solid #ec161638' } : {}),
    };
    /**
     * 'children[1]` is a row of `dataSource`
     * Check if `children[1]` is an array
     * because antd gives 'No Data' element when `dataSource` is an empty array
     */
    return (
      <tr ref={setNodeRef} {...attributes} {...restProps} style={style}>
        {children instanceof Array
          ? children?.map((child) => {
              const { key, ...rest } = child;
              return key === 'dragHandle' ? (
                <td {...listeners} {...rest}>
                  {child}
                </td>
              ) : (
                <td {...rest}>{child}</td>
              );
            })
          : children}
      </tr>
    );
  }
};

export default DraggableTable;
