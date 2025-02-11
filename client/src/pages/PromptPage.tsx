import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";

const PromptPage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/editor", { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-center mb-8">
          <Wand2 className="w-12 h-12 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Olt</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Describe your dream website
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Example: Create a modern landing page for a coffee shop with a hero section, about us, menu, and contact form..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            Generate Website
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Let AI help you build your next website in seconds
        </p>
      </div>
    </div>
  );
};

export default PromptPage;
