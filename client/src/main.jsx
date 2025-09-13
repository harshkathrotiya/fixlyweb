import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Import Tailwind CSS first, then custom styles
import './styles/tailwind.css'
// Import global styles after Tailwind to allow overrides
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />);