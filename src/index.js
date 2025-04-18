import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App, App1 } from './App';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chatbot" element={<App1 />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
