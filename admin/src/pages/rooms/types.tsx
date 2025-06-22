export interface Room {
  room_id: string;
  room_name: string;
  capacity: number;
  location: string;
  status: string;
}

export type ExamRoom = {
  room_id: string;       
  room_name: string;
  capacity: number;
  location: string;
  status: "schedule" | "ongoing" | "complete" | "cancelled"; 
};
