import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { FileItem, Step, StepType } from "../types";
import FileExplorer from "../components/FileExplorer";
import { Play, Save, Terminal, ChevronDown, ChevronRight } from "lucide-react";
import axios from "axios";
import { parseXml } from "../parse";

const EditorPage: React.FC = () => {
  const SERVER_URL =
    import.meta.env.VITE_STATE === "production"
      ? import.meta.env.VITE_SERVER_URL_PROD
      : import.meta.env.VITE_SERVER_URL_DEV;

  const location = useLocation();
  const navigate = useNavigate();
  const prompt = location.state?.prompt || "";
  const [steps, setSteps] = useState<Step[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: "src",
      type: "folder",
      content: "",
      path: "/",
      children: [
        {
          name: "index.html",
          type: "file",
          path: "/src",
          content:
            "<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Website</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>",
        },
        {
          name: "styles.css",
          type: "file",
          path: "/src",
          content:
            "body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}",
        },
      ],
    },
  ]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = [...originalFiles];
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
  }, [steps, files]);

  const handleFileSelect = (file: FileItem) => {
    if (file.type === "file") {
      setSelectedFile(file);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (selectedFile && value) {
      // Update the file content in the files structure
      const updateFileContent = (items: FileItem[]): FileItem[] => {
        return items.map((item) => {
          if (item.name === selectedFile.name) {
            return { ...item, content: value };
          }
          if (item.children) {
            return {
              ...item,
              children: updateFileContent(item.children),
            };
          }
          return item;
        });
      };

      setFiles(updateFileContent(files));
    }
  };

  const handlePreview = () => {
    navigate("/preview", { state: { ...location.state, files } });
  };
  async function init() {
    const response = await axios.post(`${SERVER_URL}/template`, {
      prompt: prompt.trim(),
    });
    const { prompts, uiPrompts } = response.data;
    setSteps(
      parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending",
      }))
    );
    const stepsResponse = await axios.post(`${SERVER_URL}/chat`, {
      messages: [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    });
    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        status: "pending" as "pending",
      })),
    ]);
    useEffect(() => {
      init();
    }, []);
  }
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Website Builder</h1>
          <div className="px-4 py-1 bg-gray-700 rounded text-sm">
            {prompt.slice(0, 50)}...
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Save size={16} />
            Save
          </button>
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-green-600 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Play size={16} />
            Preview
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-64 flex flex-col border-r border-gray-200">
          {/* Setup Instructions Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-indigo-600" />
                Setup Instructions
              </div>
              {showInstructions ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {showInstructions && (
              <div className="p-4 space-y-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    1. Create Project
                  </h3>
                  <div className="bg-gray-800 text-gray-200 p-2 rounded text-xs font-mono">
                    mkdir my-website && cd my-website
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    2. Initialize Project
                  </h3>
                  <div className="bg-gray-800 text-gray-200 p-2 rounded text-xs font-mono">
                    npm init -y
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    3. Create Files
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Create the following files with the content from the editor:
                  </p>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>src/index.html</li>
                    <li>src/styles.css</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    4. Install Dependencies
                  </h3>
                  <div className="bg-gray-800 text-gray-200 p-2 rounded text-xs font-mono">
                    npm install vite
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    5. Start Development Server
                  </h3>
                  <div className="bg-gray-800 text-gray-200 p-2 rounded text-xs font-mono">
                    npx vite
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* File Explorer */}
          <div className="flex-1 overflow-y-auto">
            <FileExplorer files={files} onFileSelect={handleFileSelect} />
          </div>
        </div>

        <div className="flex-1 bg-gray-50">
          {selectedFile ? (
            <Editor
              height="100%"
              defaultLanguage={
                selectedFile.name.endsWith(".html") ? "html" : "css"
              }
              value={selectedFile.content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a file to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
