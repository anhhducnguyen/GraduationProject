
import { CalendarEvent } from "@schedule-x/calendar";
import "./style.css";

type Props = {
  calendarEvent: CalendarEvent;
};

type Student = {
  id: string;
  lastName: string;
  firstName: string;
  status: string;
};

const sampleStudents: Student[] = [
  { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
  { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
  { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
  { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
  { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
  { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
  { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
  { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
  { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
  { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
  { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
  { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
  { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
  { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
  { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
  { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
  { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
  { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
  { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
  { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
  { id: "21012478", lastName: "Nguyen Duc", firstName: "Anh", status: "Có mặt" },
  { id: "21012477", lastName: "Nguyen Thi Mai", firstName: "Ngan", status: "Có mặt" },
  { id: "21012466", lastName: "Hoang Thi Ngoc", firstName: "Huyen", status: "Vắng mặt" },
  { id: "21012455", lastName: "Nguyen Thi", firstName: "Ha", status: "Vắng mặt" },
];

export default function CustomEventModal({ calendarEvent }: Props) {
  return (
    // <div className="fixed top-0 left-0 w-full h-full sm:top-1/2 sm:left-1/2 sm:w-3/5 sm:h-auto transform sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">

    <div className="fixed top-0 right-0 w-full h-full sm:w-4/5 sm:h-full bg-white p-6 rounded-l-lg shadow-lg z-50 overflow-y-auto">

      <div className="max-h-full sm:max-h-[90vh] overflow-y-auto p-4 scrollbar-hidden">
        <p className="font-semibold">{calendarEvent.title}</p>
        <p className="mt-1">
          <span className="font-semibold">Thời gian:</span> {calendarEvent.start} - {calendarEvent.end}
        </p>
        <p className="mt-1 mb-3">
          <span className="font-semibold">Lớp:</span> {calendarEvent.description} - (Phòng học: {calendarEvent.room})
        </p>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="p-4">
                  <input type="checkbox" className="w-4 h-4" />
                </th>
                <th className="px-6 py-3">STT</th>
                <th className="px-6 py-3">Mã số</th>
                <th className="px-6 py-3">Họ đệm</th>
                <th className="px-6 py-3">Tên</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {sampleStudents.map((student, index) => (
                <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
                  <td className="px-6 py-4">{student.lastName}</td>
                  <td className="px-6 py-4">{student.firstName}</td>
                  <td className="px-6 py-4">{student.status}</td>
                  <td className="px-6 py-4">
                    <a href="#" className="text-blue-600 hover:underline">Edit</a>
                    <a href="#" className="text-red-600 hover:underline ml-3">Remove</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

