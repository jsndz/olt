"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basePrompt = void 0;
exports.basePrompt = '<boltArtifact id="project-import" title="Project Files">' +
    '<boltAction type="file" filePath="index.html">' +
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Web Starter</title>\n<link rel="stylesheet" href="styles.css">\n</head>\n<body>\n<h1>Hello, Web!</h1>\n<script src="script.js"></script>\n</body>\n</html>' +
    "</boltAction>" +
    '<boltAction type="file" filePath="styles.css">' +
    "body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }" +
    "</boltAction>" +
    '<boltAction type="file" filePath="script.js">' +
    'document.addEventListener("DOMContentLoaded", () => { console.log("Hello from JavaScript!"); });' +
    "</boltAction>" +
    "</boltArtifact>";
