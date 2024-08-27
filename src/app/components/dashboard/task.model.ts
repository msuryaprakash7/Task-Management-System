// task.model.ts
export interface Task {
  _id: string;
  title: string;
  description: string;
  createdAt: Date; // Ensure this is a Date object or can be parsed as one
  type: string;
}
