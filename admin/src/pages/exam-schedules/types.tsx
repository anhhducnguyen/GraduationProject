export type Room = {
  room_id: number;
  room_name: string;
  capacity: number;
};

export type Student = {
  student_id: number;
  first_name: string;
  last_name: string;
  is_present: number;
  updated_at: string;
};

export type ExamSchedule = {
  schedule_id: number;
  name_schedule: string;
  status: string;
  start_time: string;
  end_time: string;
  room?: Room;
  students?: Student[];
};