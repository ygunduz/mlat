import React from 'react'
import {createRoot} from 'react-dom/client'
import App from './App'
import {AppProvider} from "./context/AppContext";

//theme
import "primereact/resources/themes/lara-light-purple/theme.css";
//core
import "primereact/resources/primereact.min.css";
//icons
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./style.css";

const container = document.getElementById('root')

const root = createRoot(container)

root.render(
    <React.StrictMode>
        <AppProvider>
            <App/>
        </AppProvider>
    </React.StrictMode>
)
