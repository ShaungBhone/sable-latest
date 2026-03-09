export type TodoBucket = "today" | "overdue" | "upcoming";
export type TodoTab = TodoBucket | "all";
export type TodoPriority = "High" | "Medium" | "Low";

export interface TodoApiItem {
  id: string;
  customerId: string;
  customerName: string;
  company: string;
  subject: string;
  priority: TodoPriority;
  nextStep: string;
  dueAt: string;
  bucket: TodoBucket;
  noteCount: number;
  assignee: string;
}

export interface TodoRow {
  id: string;
  customerId: string;
  customerName: string;
  company: string;
  subject: string;
  priority: TodoPriority;
  nextStep: string;
  dueDateLabel: string;
  dueAt: string;
  bucket: TodoBucket;
  noteCount: number;
  assignee: string;
}
