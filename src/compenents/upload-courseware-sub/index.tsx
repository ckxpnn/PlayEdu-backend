import { useEffect, useState } from "react";
import { Row, Col, Empty, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { resource } from "../../api";
import styles from "./index.module.less";
import { TreeCategory, UploadCoursewareButton } from "../../compenents";

interface VideoItem {
  id: number;
  name: string;
  created_at: string;
  type: string;
  url: string;
  path: string;
  size: number;
  extension: string;
  admin_id: number;
}

interface DataType {
  id: React.Key;
  name: string;
  created_at: string;
  type: string;
  url: string;
  path: string;
  size: number;
  extension: string;
  admin_id: number;
}

interface PropsInterface {
  defaultCheckedList: any[];
  label: string;
  open: boolean;
  onSelected: (arr: any[], videos: []) => void;
  onSuccess: () => void;
}

export const UploadCoursewareSub = (props: PropsInterface) => {
  const [category_ids, setCategoryIds] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [existingTypes, setExistingTypes] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);

  // 加载列表
  useEffect(() => {
    getvideoList();
  }, [props.open, category_ids, refresh, page, size]);

  useEffect(() => {
    if (props.defaultCheckedList.length > 0) {
      setSelectedRowKeys(props.defaultCheckedList);
    }
  }, [props.defaultCheckedList]);

  // 获取列表
  const getvideoList = () => {
    let categoryIds = category_ids.join(",");
    resource
      .resourceList(
        page,
        size,
        "",
        "",
        "",
        "WORD,EXCEL,PPT,PDF,TXT,RAR,ZIP",
        categoryIds
      )
      .then((res: any) => {
        setTotal(res.data.result.total);
        setExistingTypes(res.data.existing_types);
        setVideoList(res.data.result.data);
        props.onSuccess();
      })
      .catch((err) => {
        console.log("错误,", err);
      });
  };

  // 重置列表
  const resetVideoList = () => {
    setPage(1);
    setVideoList([]);
    setRefresh(!refresh);
  };

  const paginationProps = {
    current: page, //当前页码
    pageSize: size,
    total: total, // 总条数
    onChange: (page: number, pageSize: number) =>
      handlePageChange(page, pageSize), //改变页码的函数
    showSizeChanger: true,
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
    setSize(pageSize);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "课件",
      render: (_, record: any) => (
        <div className="d-flex">
          <i
            className="iconfont icon-icon-file"
            style={{
              fontSize: 14,
              color: "rgba(0,0,0,0.3)",
            }}
          />
          <div className="video-title ml-8">{record.name}</div>
        </div>
      ),
    },
    {
      title: "类型",
      render: (_, record: any) => <span>{record.type}</span>,
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      let row: any = selectedRows;
      let arrVideos: any = [];
      if (row) {
        for (var i = 0; i < row.length; i++) {
          if (props.defaultCheckedList.indexOf(row[i].id) === -1) {
            arrVideos.push({
              name: row[i].name,
              type: row[i].type,
              rid: row[i].id,
            });
          }
        }
        props.onSelected(selectedRowKeys, arrVideos);
      }
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record: any) => ({
      disabled: props.defaultCheckedList.indexOf(record.id) !== -1, //禁用的条件
    }),
  };

  return (
    <>
      <Row style={{ width: 752, minHeight: 520 }}>
        <Col span={7}>
          <TreeCategory
            selected={[]}
            type="no-cate"
            text={props.label}
            onUpdate={(keys: any) => setCategoryIds(keys)}
          />
        </Col>
        <Col span={17}>
          <Row style={{ marginBottom: 24, paddingLeft: 10 }}>
            <Col span={24}>
              <UploadCoursewareButton
                categoryIds={category_ids}
                onUpdate={() => {
                  resetVideoList();
                }}
              ></UploadCoursewareButton>
            </Col>
          </Row>
          <div className={styles["video-list"]}>
            {videoList.length === 0 && (
              <Col span={24} style={{ marginTop: 150 }}>
                <Empty description="暂无课件" />
              </Col>
            )}
            {videoList.length > 0 && (
              <div className="list-select-column-box c-flex">
                <Table
                  rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                  }}
                  columns={columns}
                  dataSource={videoList}
                  loading={loading}
                  pagination={paginationProps}
                  rowKey={(record) => record.id}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};
