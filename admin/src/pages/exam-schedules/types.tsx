export interface ExamRoom {
  room_id: number;
  room_name: string;
}

export interface ExamSchedule {
  schedule_id: number;
  name_schedule: string;
  start_time: string;   // ISO 8601 datetime string, e.g. "2025-05-23T09:00:00Z"
  end_time: string;
  room_id: number;
  status: "scheduled" | "completed" | "cancelled"; // Optional: use union type for better safety
  created_by?: string | null;
}
