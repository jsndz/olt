import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FileItem } from "../types";
import { PreviewFrame } from "../components/PreviewFrames";
import { useWebContainer } from "../hooks";

const PreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const files = location.state?.files as FileItem[];
  const webcontainer = useWebContainer();

  // Find HTML and CSS content
  const findFileContent = (files: FileItem[], fileName: string): string => {
    for (const file of files) {
      if (file.type === "file" && file.name === fileName) {
        return file.content!;
      }
      if (file.children) {
        const content = findFileContent(file.children, fileName);
        if (content) return content;
      }
    }
    return "";
  };

  const htmlContent = findFileContent(files || [], "index.html");
  const cssContent = findFileContent(files || [], "styles.css");

  // Combine HTML and CSS
  const combinedContent = `
    <style>${cssContent}</style>
    ${htmlContent}
  `;

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/editor", { state: location.state })}
            className="flex items-center gap-2 hover:text-gray-300"
          >
            <ArrowLeft size={16} />
            Back to Editor
          </button>
          <div className="h-6 w-px bg-gray-600" />
          <h1 className="text-xl font-semibold">Preview</h1>
        </div>
      </div>

      <div className="flex-1 bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
          {/* Preview Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-sm text-gray-500">Preview</div>
          </div>

          {/* Preview Content */}
          <PreviewFrame webContainer={webcontainer!} files={files} />
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
