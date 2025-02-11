export enum StepType {
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
  RunScript,
}
export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: "pending" | "in-progress" | "completed";
  code?: string;
  path?: string;
}

export interface FileItem {
  name: string;
  type: "file" | "folder";
  children?: FileItem[];
  content?: string;
  path: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}
