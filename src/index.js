import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import {DataLoader} from './components/DataLoader';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

root.render(
    <>
        <DataLoader />
    </>
);	


