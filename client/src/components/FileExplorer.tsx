import React from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { FileStructure } from '../types';

interface FileExplorerProps {
  files: FileStructure[];
  onFileSelect: (file: FileStructure) => void;
}

const FileExplorerItem: React.FC<{
  item: FileStructure;
  onFileSelect: (file: FileStructure) => void;
  level?: number;
}> = ({ item, onFileSelect, level = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(item);
    }
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 cursor-pointer"
        style={{ paddingLeft: `${level * 12}px` }}
        onClick={handleClick}
      >
        {item.type === 'folder' && (
          <span className="w-4 h-4">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
        {item.type === 'folder' ? (
          <Folder size={16} className="text-blue-500" />
        ) : (
          <File size={16} className="text-gray-500" />
        )}
        <span className="text-sm">{item.name}</span>
      </div>
      {item.type === 'folder' && isOpen && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileExplorerItem
              key={index}
              item={child}
              onFileSelect={onFileSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  return (
    <div className="w-64 border-r border-gray-200 h-full overflow-y-auto">
      {files.map((file, index) => (
        <FileExplorerItem key={index} item={file} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
};

export default FileExplorer;