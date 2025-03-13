import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styletemplate/css/bootstrap-grid.css'
import './styletemplate/css/bootstrap-grid.min.css'
import './styletemplate/css/bootstrap-reboot.css'
import './styletemplate/css/bootstrap-reboot.min.css'
import './styletemplate/css/bootstrap.css'
import './styletemplate/css/bootstrap.min.css'
import './styletemplate/css/style.css'
import './styletemplate/css/style.min.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);


