
// import { CalendarEvent } from "@schedule-x/calendar";
// import "./style.css";

// type Props = {
//   calendarEvent: CalendarEvent;
// };

// type Student = {
//   id: string;
//   lastName: string;
//   firstName: string;
//   status: string;
// };

// const sampleStudents: Student[] = [
//   { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
//   { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
//   { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
//   { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
//   { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
//   { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
//   { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
//   { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
//   { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
//   { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
//   { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
//   { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
//   { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
//   { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
//   { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
//   { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
//   { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
//   { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
//   { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
//   { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
//   { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
//   { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
//   { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
//   { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
// ];

// export default function CustomEventModal({ calendarEvent }: Props) {
//   return (
//     // <div className="fixed top-0 left-0 w-full h-full sm:top-1/2 sm:left-1/2 sm:w-3/5 sm:h-auto transform sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">

//     <div className="fixed top-0 right-0 w-full h-full sm:w-4/5 sm:h-full bg-white p-6 rounded-l-lg shadow-lg z-50 overflow-y-auto">

//       <div className="max-h-full sm:max-h-[90vh] overflow-y-auto p-4 scrollbar-hidden">
//         <p className="font-semibold">{calendarEvent.title}</p>
//         <p className="mt-1">
//           <span className="font-semibold">Thời gian:</span> {calendarEvent.start} - {calendarEvent.end}
//         </p>
//         <p className="mt-1 mb-3">
//           <span className="font-semibold">Lớp:</span> {calendarEvent.description} - (Phòng học: {calendarEvent.room})
//         </p>
//         <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
//           <table className="w-full text-sm text-left text-gray-500">
//             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//               <tr>
//                 <th className="p-4">
//                   <input type="checkbox" className="w-4 h-4" />
//                 </th>
//                 <th className="px-6 py-3">STT</th>
//                 <th className="px-6 py-3">Mã số</th>
//                 <th className="px-6 py-3">Họ đệm</th>
//                 <th className="px-6 py-3">Tên</th>
//                 <th className="px-6 py-3">Trạng thái</th>
//                 <th className="px-6 py-3">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sampleStudents.map((student, index) => (
//                 <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
//                   <td className="p-4">
//                     <input type="checkbox" className="w-4 h-4" />
//                   </td>
//                   <td className="px-6 py-4">{index + 1}</td>
//                   <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
//                   <td className="px-6 py-4">{student.lastName}</td>
//                   <td className="px-6 py-4">{student.firstName}</td>
//                   <td className="px-6 py-4">{student.status}</td>
//                   <td className="px-6 py-4">
//                     <a href="#" className="text-blue-600 hover:underline">Edit</a>
//                     <a href="#" className="text-red-600 hover:underline ml-3">Remove</a>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Flex, Tooltip, Input, Space } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { DownloadOutlined, ReloadOutlined, CloseOutlined } from '@ant-design/icons';
import { RiFileExcel2Fill } from "react-icons/ri";
import { CalendarEvent } from '@schedule-x/calendar';
import type { ConfigProviderProps } from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router';
import { useTranslate } from "@refinedev/core";
import { IoAddSharp } from "react-icons/io5";
import 'dayjs/locale/vi';
import 'dayjs/locale/en';
import { useGetLocale } from "@refinedev/core";
import { Upload } from 'antd';
// import { Student } from './types';
import { Modal } from 'antd';
import { PiTrashSimpleDuotone } from "react-icons/pi";


export type Student = {
  id: string;
  lastName: string;
  firstName: string;
  status: string;
  confidence: number;
  checkInTime: string;
};

type Props = {
  calendarEvent: CalendarEvent;
};

type SizeType = ConfigProviderProps['componentSize'];

export default function CustomEventModal({ calendarEvent }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [size, setSize] = useState<SizeType>('large');
  const [visible, setVisible] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const navigate = useNavigate();
  const translate = useTranslate();
  const getLocale = useGetLocale();
  const locale = getLocale();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const token = localStorage.getItem("refine-auth");


  dayjs.locale(locale);

  const getColumnSearchProps = (dataIndex: keyof Student): ColumnType<Student> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Nhập mã sinh viên`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm();
            setSearchText(selectedKeys[0] as string);
            setSearchedColumn(dataIndex as string);
          }}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
              setSearchText(selectedKeys[0] as string);
              setSearchedColumn(dataIndex as string);
            }}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => {
              clearFilters?.();
              setSearchText('');
            }}
            size="small"
            style={{ width: 90 }}
          >
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <svg
        viewBox="0 0 1024 1024"
        width="1em"
        height="1em"
        fill={filtered ? '#1890ff' : 'currentColor'}
      >
        <path d="M349 789h326c20.3 0 30.4 24.5 16.1 39.1L538.1 994c-9.4 9.8-24.8 9.8-34.2 0L332.9 828.1C318.6 813.5 328.7 789 349 789zM886.3 288H137.7c-22.1 0-33.2-26.7-17.6-42.3l374.3-374.3c10-10 26.2-10 36.2 0l374.3 374.3c15.6 15.6 4.5 42.3-17.6" />
      </svg>
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
  });

  const columns: ColumnsType<Student> = [
    {
      title: translate("attendance.index", "STT"),
      dataIndex: 'index',
      key: 'index',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: translate("attendance.student_id", "Mã số"),
      dataIndex: 'id',
      key: 'id',
      ...getColumnSearchProps('id'),
    },
    {
      title: translate("attendance.last_name", "Họ đệm"),
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: translate("attendance.first_name", "Tên"),
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: translate("attendance.status", "Trạng thái"),
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        const color = text === "present" ? "green" : "red";
        return <Tag color={color}>{translate(`attendance.${text}`, text)}</Tag>;
      },
      filters: [
        { text: translate("attendance.present"), value: "present" },
        { text: translate("attendance.absent"), value: "absent" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: translate("attendance.confidence", "Độ chính xác (%)"),
      dataIndex: 'confidence',
      key: 'confidence',
      sorter: (a, b) => a.confidence - b.confidence,
    },
    {
      title: translate("attendance.checkin_time", "Thời gian điểm danh"),
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (text) => dayjs(text).format('HH:mm:ss DD/MM/YYYY'),
    },
  ];

  const fetchStudents = async () => {
    if (!calendarEvent?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/exam-schedules/${calendarEvent.id}/students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data.results)) {
        setStudents(data.results);
      } else {
        console.error("Dữ liệu sinh viên không đúng định dạng:", data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách sinh viên:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [calendarEvent.id]);

  const handleDownload = () => {
    if (!students.length) return;
    const worksheetData = students.map((s, idx) => ({
      STT: idx + 1,
      "Mã số": s.id,
      "Họ đệm": s.lastName,
      "Tên": s.firstName,
      "Trạng thái": s.status,
      "Độ chính xác (%)": s.confidence,
      "Thời gian điểm danh": dayjs(s.checkInTime).format('HH:mm:ss DD/MM/YYYY')
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách điểm danh');
    const fileName = `Danh_sach_${calendarEvent.description || 'lop'}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  if (!visible) return null;

  const handleImportExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[];

      // Lấy danh sách chỉ gồm id
      const studentIds: string[] = jsonData.map((row) => row['Mã số'] || row['id']).filter(Boolean);

      try {
        const res = await fetch(`/api/v1/exam-schedules/${calendarEvent.id}/students/import-ids`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ studentIds }),
        });

        if (!res.ok) throw new Error('Lỗi khi gửi danh sách mã số sinh viên');

        fetchStudents(); // Tải lại danh sách sinh viên sau khi import
      } catch (error) {
        console.error("Lỗi khi import Excel:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteSelected = () => {
    if (!selectedRowKeys.length) return;

    Modal.confirm({
      centered: true,
      title: translate("attendance.confirm_delete_title", "Xác nhận xoá"),
      content: translate("attendance.confirm_delete_message", { count: selectedRowKeys.length }),
      okText: translate("attendance.delete", "Xoá"),
      okType: "danger",
      cancelText: translate("attendance.cancel", "Huỷ"),
      onOk: async () => {
        try {
          const res = await fetch(`/api/v1/exam-schedules/${calendarEvent.id}/students/delete`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ studentIds: selectedRowKeys }),
          });

          if (!res.ok) throw new Error("Lỗi khi xoá sinh viên");

          setSelectedRowKeys([]);
          fetchStudents();
        } catch (err) {
          console.error("Xoá sinh viên lỗi:", err);
        }
      },
    });
  };

  return (
    <div className="fixed top-[0px] right-0 sm:right-[30px] sm:w-4/5 w-full h-full bg-white p-6 rounded-l-lg shadow-2xl z-50 overflow-y-scroll no-scrollbar">
      <button onClick={() => setVisible(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl" aria-label="Đóng">
        <CloseOutlined />
      </button>
      <div
        className="max-h-full sm:max-h-[90vh] overflow-y-auto no-scrollbar"
        style={{
          paddingBottom: '2rem',
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`/* Chrome, Safari */
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }`}
        </style>

        <p className="text-black mb-1">
          <span className="font-semibold">{translate("attendance.class", "Môn thi")}:</span> {calendarEvent.description} <em className="text-gray-500 italic">({dayjs(calendarEvent.end).diff(dayjs(calendarEvent.start), 'minute')} {translate("attendance.minute", "phút")}) {' '}</em> - <span className="font-semibold">{translate("attendance.room", "Phòng")}:</span> {calendarEvent.room}
        </p>
        <p className="text-black mb-1">
          <span className="font-semibold">
            {translate("attendance.time", "Thời gian")}:
          </span>{' '}
          {dayjs(calendarEvent.start).format('HH:mm')} - {dayjs(calendarEvent.end).format('HH:mm')}{' '}
          <em className="text-gray-500 italic">
            ({dayjs(calendarEvent.start).format('dddd, DD/MM/YYYY')})
          </em>
        </p>
        <p className="text-black mb-4">
          <span className="font-semibold">{translate("attendance.lecturer", "Giảng viên")}:</span>{' '}
          Nguyễn Văn Kim, Phạm Văn Huy
        </p>
        <Flex gap="small" wrap justify="end" className="mb-4">
          <Tooltip title={translate("attendance.reload_data", "Tải lại dữ liệu")}>
            <Button shape="circle" icon={<ReloadOutlined />} size={size} style={{ backgroundColor: '#1976d2', color: 'white' }} onClick={fetchStudents} />
          </Tooltip>
        </Flex>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          pagination={{ pageSize: 40 }}
          bordered
          loading={loading}
        />

      </div>
    </div>
  );
}
