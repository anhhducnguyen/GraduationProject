// types.ts

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: "male" | "female" | "other";
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}
