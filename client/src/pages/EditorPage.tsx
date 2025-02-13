import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { FileItem, Step, StepType } from "../types";
import FileExplorer from "../components/FileExplorer";
import { Play, Save, Terminal, ChevronDown, ChevronRight } from "lucide-react";
import axios from "axios";
import { parseXml } from "../parse";
import { useWebContainer } from "../hooks";
import { StepsList } from "../components/StepList";
import { PreviewFrame } from "../components/PreviewFrames";

const EditorPage: React.FC = () => {
  const SERVER_URL =
    import.meta.env.VITE_STATE === "production"
      ? import.meta.env.VITE_SERVER_URL_PROD
      : import.meta.env.VITE_SERVER_URL_DEV;
  const webcontainer = useWebContainer();
  const location = useLocation();

  const navigate = useNavigate();
  const [userPrompt, setPrompt] = useState("");

  const { prompt } = location.state as { prompt: string };
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [preview, setPreview] = useState<boolean>(false);
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      //gets the steps with pending state
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          //["app.js","index.html","src"]
          let currentFileStructure = [...originalFiles];
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            // the path is not empty or not the final file
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);
            //get the first file/folder
            if (!parsedPath.length) {
              //if it is  the last file
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              //try to find the file
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
                //create if file doesnt exist
              } else {
                file.content = step.code;
                //update content
              }
            } else {
              //if it is not the last file
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              //find the folder
              if (!folder) {
                //create
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }
              //move to the children
              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      // if updated change status
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

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            // give file.name as a Record key
            // if it has a children add children
            // else init {}
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          //if it is a root folder

          if (isRootFolder) {
            //update
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            //  create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

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
  useEffect(() => {
    init();
  }, []);
  const handlePreview = () => {
    // navigate("/preview", { state: { ...location.state, files } });
    setPreview(true);
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
    setLlmMessages(
      [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      }))
    );
    setLlmMessages((x) => [
      ...x,
      { role: "assistant", content: stepsResponse.data.response },
    ]);
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
              <div className="col-span-1 space-y-6 overflow-auto">
                <div>
                  <div className="max-h-[75vh] overflow-scroll">
                    <StepsList
                      steps={steps}
                      currentStep={currentStep}
                      onStepClick={setCurrentStep}
                    />
                  </div>
                  <div>
                    <div className="flex">
                      <br />
                      {
                        <div className="flex">
                          <textarea
                            value={userPrompt}
                            onChange={(e) => {
                              setPrompt(e.target.value);
                            }}
                            className="p-2 w-full"
                          ></textarea>
                          <button
                            onClick={async () => {
                              const newMessage = {
                                role: "user" as "user",
                                content: userPrompt,
                              };

                              const stepsResponse = await axios.post(
                                `${SERVER_URL}/chat`,
                                {
                                  messages: [...llmMessages, newMessage],
                                }
                              );

                              setLlmMessages((x) => [...x, newMessage]);
                              setLlmMessages((x) => [
                                ...x,
                                {
                                  role: "assistant",
                                  content: stepsResponse.data.response,
                                },
                              ]);

                              setSteps((s) => [
                                ...s,
                                ...parseXml(stepsResponse.data.response).map(
                                  (x) => ({
                                    ...x,
                                    status: "pending" as "pending",
                                  })
                                ),
                              ]);
                            }}
                            className="bg-purple-400 px-4"
                          >
                            Send
                          </button>
                        </div>
                      }
                    </div>
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
          {preview ? (
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
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              wait{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
