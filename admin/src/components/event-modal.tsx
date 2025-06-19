import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Flex, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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


type Props = {
  calendarEvent: CalendarEvent;
  onClose: () => void;
};

type Student = {
  id: string;
  lastName: string;
  firstName: string;
  status: string;
  confidence: number;
  checkInTime: string;
};

type SizeType = ConfigProviderProps['componentSize'];

export default function CustomEventModal({ calendarEvent, onClose }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [size, setSize] = useState<SizeType>('large');
  const navigate = useNavigate();
  const translate = useTranslate();

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
      const res = await fetch(`/api/v1/exam-schedules/${calendarEvent.id}/students`);
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

  useEffect(() => {
    const ids = students.map(s => s.id);
    const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      console.warn("❗ Duplicate IDs detected:", duplicates);
    }
  }, [students]);

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

  return (
    <div className="mt-10 fixed top-[30px] right-0 sm:right-[30px] sm:w-4/5 w-full h-full bg-white p-6 rounded-l-lg shadow-lg z-50 overflow-y-auto">
      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        aria-label="Đóng"
      >
        <CloseOutlined />
      </button>

      <div className="max-h-full sm:max-h-[90vh] overflow-y-auto">
        <p className="text-black mb-1">
          <span className="font-semibold">Lớp:</span> {calendarEvent.description} — <span className="font-semibold">Phòng:</span> {calendarEvent.room}
        </p>
        <p className="text-black mb-1">
          <span className="font-semibold">Thời gian:</span> {calendarEvent.start} - {calendarEvent.end}
        </p>
        <p className="text-black mb-4">
          <span className="font-semibold">Giảng viên:</span> Nguyễn Văn Kim, Phạm Văn Huy
        </p>

        <Flex gap="small" wrap justify="end" className="mb-4">
          <Button
            icon={<DownloadOutlined />}
            size={size}
            style={{ backgroundColor: '#1976d2', borderColor: '#1890ff', color: 'white' }}
            onClick={handleDownload}
          >
            {translate("attendance.download_list", "Tải danh sách")}
          </Button>
          <Button
            icon={<RiFileExcel2Fill />}
            size={size}
            style={{ backgroundColor: '#1976d2', borderColor: '#1890ff', color: 'white' }}
          >
            {translate("attendance.import_excel", "Nhập sinh viên từ Excel")}
          </Button>
          <Button
            size={size}
            style={{ backgroundColor: '#1976d2', borderColor: '#1890ff', color: 'white' }}
          >
            {translate("attendance.start_exam", "Bắt đầu ca thi")}
          </Button>
          <Button
            icon={<IoAddSharp />}
            size={size}
            style={{ backgroundColor: '#1976d2', borderColor: '#1890ff', color: 'white' }}
            onClick={() => navigate('/add')}
          >
            {translate("attendance.add_students", "Thêm sinh viên vào ca thi")}
          </Button>
          <Tooltip title={translate("attendance.reload_data", "Tải lại dữ liệu")}>
            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              size={size}
              style={{ backgroundColor: '#4caf50', borderColor: '#4caf50', color: 'white' }}
              onClick={fetchStudents}
            />
          </Tooltip>
        </Flex>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          loading={loading}
        />
      </div>
    </div>
  );
}

