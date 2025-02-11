export interface FileStructure {
  name: string;
  content: string;
  type: 'file' | 'folder';
  children?: FileStructure[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}