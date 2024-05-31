import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/Globals.css'
import Home from './AppRouter';
import Aos from 'aos';
import 'aos/dist/aos.css';
// import reportWebVitals from './reportWebVitals';
  Aos.init({
      easing:'ease-in-cubic',
      delay:100,
      offset:300,
      once:true
  });
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Home />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
