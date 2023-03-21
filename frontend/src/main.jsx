import React from 'react'
import {createRoot} from 'react-dom/client'

//theme
// import "primereact/resources/themes/lara-light-purple/theme.css";
import "primereact/resources/themes/rhea/theme.css";
//core
import "primereact/resources/primereact.min.css";
//icons
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./style.css";
import App from "./App.jsx";
import ToastProvider from "./ToastProvider";

const container = document.getElementById('root')

const root = createRoot(container)

root.render(
    <React.StrictMode>
        <ToastProvider>
            <App />
        </ToastProvider>
    </React.StrictMode>
)
