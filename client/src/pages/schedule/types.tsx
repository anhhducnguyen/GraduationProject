// Event type
export interface MyCalendarEvent {
  id: number | string;
  title: string;
  start: string;
  end: string;
  description?: string;
  room?: string;
  teacher?: string;
  color?: string;
  status?: string;
  [key: string]: any;
}

// API item type
export interface ApiEventItem {
  schedule_id: number;
  start_time: string;
  end_time: string;
  room_id: number;
  status: 'scheduled' | 'completed' | 'cancelled' | string;
  name_schedule: string;
  room_name: string;
}

// API response structure
export interface ApiResponse {
  results: ApiEventItem[];
}

// show.txt

export type Student = {
  id: string;
  lastName: string;
  firstName: string;
  status: string;
  confidence: number;
  checkInTime: string;
};