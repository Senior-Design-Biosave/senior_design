import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css"; // Import global styles

import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);