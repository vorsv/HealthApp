import React, { useState, useEffect, useCallback, useRef } from 'react';
// The Recharts library will be loaded dynamically via a script tag.
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } = window.Recharts || {};

// <<< NEW: API Endpoint Configuration >>>
// This function now automatically determines the correct API server address
// for production (your public URL), local development, and local network access.
const getApiBaseUrl = () => {
    const publicUrl = 'https://havorsv.share.zrok.io';
    const localNetworkUrl = 'http://192.168.1.118:6969';
    const localDevUrl = 'http://localhost:6969';

    const currentHostname = window.location.hostname;

    if (currentHostname === 'havorsv.share.zrok.io') {
        // App is accessed via the public, port-forwarded URL
        return publicUrl;
    } else if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
        // App is accessed on the same machine it's running on
        return localDevUrl;
    } else {
        // App is accessed from another device on the same local network
        return localNetworkUrl;
    }
};
const API_BASE_URL = getApiBaseUrl();
// <<< END NEW SECTION >>>


// Dynamically load an external script
const useScript = (url) => {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        if (window.Recharts) {
            setIsLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [url]);
    return isLoaded;
};


// This component now holds all the CSS. It injects a <style> tag into the document.
const GlobalStyles = () => {
  const css = `
    /* General Body & Theme Variables */
    :root {
      --background-light: #f3f4f6;
      --foreground-light: #ffffff;
      --text-primary-light: #1f2937;
      --text-secondary-light: #4b5563;
      --input-bg-light: #f3f4f6;
      --border-light: #e5e7eb;

      --background-dark: #111827;
      --foreground-dark: #1f2937;
      --text-primary-dark: #f9fafb;
      --text-secondary-dark: #9ca3af;
      --input-bg-dark: #374151;
      --border-dark: #374151;

      --accent-color: #06b6d4; /* cyan-500 */
      --accent-hover: #0891b2; /* cyan-600 */
      --danger-color: #ef4444; /* red-500 */
      --danger-hover: #dc2626; /* red-600 */
      --success-color: #22c55e; /* green-500 */
      --success-hover: #16a34a; /* green-600 */
      --warning-color: #f59e0b; /* amber-500 */
      --warning-hover: #d97706; /* amber-600 */
      --purple-color: #a855f7; /* purple-500 */

      --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      --transition-speed: 0.3s;
    }

    body {
      margin: 0;
      font-family: var(--font-family);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color var(--transition-speed), color var(--transition-speed);
    }

    html.dark body {
      background-color: var(--background-dark);
      color: var(--text-primary-dark);
    }

    body {
      background-color: var(--background-light);
      color: var(--text-primary-light);
    }

    /* --- Reusable Components & Layout --- */

    .app-container {
      position: relative;
    }

    .auth-layout {
      min-height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
      background-color: var(--background-light);
    }

    html.dark .auth-layout {
      background-color: var(--background-dark);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      background-color: var(--foreground-light);
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid transparent;
    }

    html.dark .auth-card {
      background-color: var(--foreground-dark);
      border: 1px solid var(--border-dark);
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .header-content .logo-container {
        margin-bottom: 0;
    }

    .logo-icon {
      width: 2rem;
      height: 2rem;
      color: var(--accent-color);
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.05em;
      color: var(--text-primary-light);
    }
    html.dark .logo-text { color: var(--text-primary-dark); }


    .auth-title {
      font-size: 1.875rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .auth-switch-text {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--text-secondary-light);
    }
    html.dark .auth-switch-text { color: var(--text-secondary-dark); }

    .auth-switch-button {
      font-weight: 600;
      color: var(--accent-color);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }
    .auth-switch-button:hover {
      text-decoration: underline;
    }

    /* Forms */
    .form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border-light);
      background-color: var(--input-bg-light);
      transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
      box-sizing: border-box;
    }
    html.dark .form-input {
      border-color: transparent;
      background-color: var(--input-bg-dark);
      color: var(--text-primary-dark);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3);
    }

    .form-button {
      width: 100%;
      padding: 0.75rem 1rem;
      color: white;
      font-weight: 600;
      border-radius: 0.5rem;
      background-color: var(--accent-color);
      border: none;
      cursor: pointer;
      transition: background-color var(--transition-speed), box-shadow var(--transition-speed);
      box-shadow: 0 4px 6px -1px rgba(6, 182, 212, 0.2), 0 2px 4px -1px rgba(6, 182, 212, 0.1);
    }

    .form-button:hover {
      background-color: var(--accent-hover);
      box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.3), 0 4px 6px -2px rgba(6, 182, 212, 0.15);
    }

    .form-button:disabled {
      background-color: #9ca3af;
      box-shadow: none;
      cursor: not-allowed;
    }

    /* Alerts */
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid;
    }
    .alert-error {
      background-color: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
    }
    .alert-success {
      background-color: #d1fae5;
      border-color: #6ee7b7;
      color: #065f46;
    }


    /* --- Theme Toggle --- */
    .theme-toggle-container {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 10;
    }

    .theme-toggle-button {
      padding: 0.5rem;
      border-radius: 9999px;
      background-color: var(--input-bg-light);
      color: var(--text-primary-light);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    html.dark .theme-toggle-button {
      background-color: var(--input-bg-dark);
      color: var(--text-primary-dark);
    }
    .theme-toggle-icon {
      width: 1.5rem;
      height: 1.5rem;
    }


    /* --- Dashboard & Settings --- */
    .page-layout {
      min-height: 100vh;
      width: 100%;
      background-color: var(--background-light);
      color: var(--text-primary-light);
    }
    html.dark .page-layout {
      background-color: var(--background-dark);
      color: var(--text-primary-dark);
    }

    .page-header {
      background-color: var(--foreground-light);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    html.dark .page-header {
      background-color: var(--foreground-dark);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 4rem;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon-button {
        background: none;
        border: none;
        padding: 0.5rem;
        color: var(--text-secondary-light);
        cursor: pointer;
        display: flex;
        align-items: center;
    }
    html.dark .header-icon-button { color: var(--text-secondary-dark); }
    .header-icon-button:hover { color: var(--accent-color); }
    
    .header-greeting {
        font-weight: 600;
        display: none;
    }
    @media (min-width: 640px) {
        .header-greeting {
            display: block;
        }
    }


    .logout-button {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      background-color: var(--danger-color);
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color var(--transition-speed);
    }
    .logout-button:hover {
      background-color: var(--danger-hover);
    }

    .page-main {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }

    .main-title {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }
    
    .loading-text {
        text-align: center;
        padding: 4rem;
        font-size: 1.25rem;
        color: var(--text-secondary-light);
    }
    html.dark .loading-text { color: var(--text-secondary-dark); }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1.5rem;
    }

    @media (min-width: 640px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media (min-width: 1200px) {
        .stats-grid {
            grid-template-columns: repeat(6, 1fr);
        }
    }

    .stat-card {
        background-color: var(--foreground-light);
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    html.dark .stat-card { background-color: var(--foreground-dark); }
    
    .stat-card-title {
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    
    .stat-card-value {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--accent-color);
        margin-bottom: 0.25rem;
    }

    .stat-card-goal {
        font-size: 0.875rem;
        color: var(--text-secondary-light);
        margin-bottom: 1rem;
    }
    html.dark .stat-card-goal { color: var(--text-secondary-dark); }

    .stat-card-no-progress .stat-card-value {
        margin-bottom: 0;
    }
    .stat-card-no-progress .stat-card-goal {
        margin-bottom: 0;
    }
    
    .progress-bar-container {
        width: 100%;
        height: 0.75rem;
        background-color: var(--input-bg-light);
        border-radius: 9999px;
        overflow: hidden;
    }
    html.dark .progress-bar-container { background-color: var(--input-bg-dark); }

    .progress-bar-fill {
        height: 100%;
        border-radius: 9999px;
        transition: width var(--transition-speed) ease-in-out;
    }
    .progress-bar-fill.calories { background-color: var(--accent-color); box-shadow: 0 0 10px var(--accent-color); }
    .progress-bar-fill.protein { background-color: var(--danger-color); box-shadow: 0 0 10px var(--danger-color); }
    .progress-bar-fill.carbs { background-color: var(--warning-color); box-shadow: 0 0 10px var(--warning-color); }
    .progress-bar-fill.fats { background-color: var(--purple-color); box-shadow: 0 0 10px var(--purple-color); } 
    .progress-bar-fill.water { background-color: #3b82f6; box-shadow: 0 0 10px #3b82f6; } /* blue-500 */


    .actions-container {
        margin-top: 2rem;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .action-button {
        flex-grow: 1;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        color: white;
        cursor: pointer;
        transition: background-color var(--transition-speed);
        text-align: center;
    }

    .action-button.add-food { background-color: var(--accent-color); }
    .action-button.add-food:hover { background-color: var(--accent-hover); }

    .action-button.log-water { background-color: var(--success-color); }
    .action-button.log-water:hover { background-color: var(--success-hover); }
    
    .action-button.log-weight { background-color: var(--warning-color); }
    .action-button.log-weight:hover { background-color: var(--warning-hover); }
    
    .food-log-section {
        margin-top: 2.5rem;
    }
    
    .food-log-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }

    .food-log-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .food-log-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 1rem;
        align-items: center;
        background-color: var(--foreground-light);
        padding: 1rem;
        border-radius: 0.75rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    html.dark .food-log-item { background-color: var(--foreground-dark); }

    .food-log-item-name {
        font-weight: 500;
    }
    .food-log-item-details {
        font-size: 0.875rem;
        color: var(--text-secondary-light);
    }
    html.dark .food-log-item-details { color: var(--text-secondary-dark); }
    
    .food-log-item-calories {
        font-weight: 600;
        text-align: right;
    }

    .delete-log-button {
        background: none;
        border: none;
        color: var(--danger-color);
        cursor: pointer;
        padding: 0.5rem;
        margin-left: -0.5rem;
    }

    /* Modal Styles */
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background-color: var(--foreground-light);
        padding: 2rem;
        border-radius: 1rem;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    html.dark .modal-content { background-color: var(--foreground-dark); }
    
    .modal-content.large {
        max-width: 800px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
    }

    .modal-close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-secondary-light);
    }
    html.dark .modal-close-button { color: var(--text-secondary-dark); }

    .search-results-list {
        list-style: none;
        padding: 0;
        margin-top: 1rem;
        max-height: 300px;
        overflow-y: auto;
    }

    .search-result-item {
        padding: 1rem;
        border-bottom: 1px solid var(--border-light);
        cursor: pointer;
        transition: background-color 0.2s;
    }
    html.dark .search-result-item { border-bottom-color: var(--border-dark); }
    .search-result-item:hover {
        background-color: var(--input-bg-light);
    }
    html.dark .search-result-item:hover { background-color: var(--input-bg-dark); }
    .search-result-item-name { font-weight: 500; }
    .search-result-item-details { font-size: 0.8rem; color: var(--text-secondary-light); }
    html.dark .search-result-item-details { color: var(--text-secondary-dark); }

    .log-food-details {
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: var(--input-bg-light);
        border-radius: 0.5rem;
    }
    html.dark .log-food-details { background-color: var(--input-bg-dark); }

    /* Settings & History Page Specific */
    .page-grid {
        display: grid;
        gap: 2rem;
        grid-template-columns: 1fr;
    }
    @media (min-width: 1024px) {
        .page-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    .range-selector {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        background-color: var(--input-bg-light);
        padding: 0.25rem;
        border-radius: 0.5rem;
        width: fit-content;
    }
    html.dark .range-selector { background-color: var(--input-bg-dark); }

    .range-button {
        flex-grow: 1;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        border: none;
        background-color: transparent;
        color: var(--text-secondary-light);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }
     html.dark .range-button { color: var(--text-secondary-dark); }

    .range-button.active {
        background-color: var(--foreground-light);
        color: var(--text-primary-light);
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    html.dark .range-button.active {
        background-color: var(--foreground-dark);
        color: var(--text-primary-dark);
    }
    
  `;
  return <style>{css}</style>;
};

// ========= ICONS (as SVG components) =========
const SunIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

const TrashIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const SettingsIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const HomeIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);

const ChartIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>
);


const Logo = () => (
    <div className="logo-container">
        <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
        <h1 className="logo-text">HealthVorsv</h1>
    </div>
);


// ========= THEME TOGGLE COMPONENT =========
const ThemeToggle = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      {theme === 'dark' ? <SunIcon className="theme-toggle-icon" /> : <MoonIcon className="theme-toggle-icon" />}
    </button>
  );
};


// ========= AUTHENTICATION PAGES =========
const AuthLayout = ({ children, title, switchText, switchLinkText, onSwitch }) => (
    <div className="auth-layout">
        <div className="auth-card">
            <Logo />
            <h2 className="auth-title">{title}</h2>
            {children}
        </div>
        <p className="auth-switch-text">
            {switchText}{' '}
            <button onClick={onSwitch} className="auth-switch-button">
                {switchLinkText}
            </button>
        </p>
    </div>
);

const LoginPage = ({ setPage, setToken, setUserData }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed.');
            setToken(data.token);
            setUserData(data.user);
            setPage('dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" switchText="Don't have an account?" switchLinkText="Sign Up" onSwitch={() => setPage('register')}>
            <form onSubmit={handleLogin} className="form">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input"/>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input"/>
                </div>
                <button type="submit" disabled={isLoading} className="form-button">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </AuthLayout>
    );
};

const RegisterPage = ({ setPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed.');
            setSuccess('Registration successful! Please log in.');
            setTimeout(() => setPage('login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Account" switchText="Already have an account?" switchLinkText="Sign In" onSwitch={() => setPage('login')}>
            <form onSubmit={handleRegister} className="form">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <div className="form-group">
                    <label className="form-label" htmlFor="reg-email">Email</label>
                    <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="reg-password">Password</label>
                    <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" />
                </div>
                 <div className="form-group">
                    <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                    <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="form-input" />
                </div>
                <button type="submit" disabled={isLoading} className="form-button">
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
        </AuthLayout>
    );
};


// ========= DASHBOARD & PAGE COMPONENTS =========

const ProgressBar = ({ value = 0, max = 1, type = 'calories' }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const displayPercentage = Math.min(percentage, 100);

    return (
        <div className="progress-bar-container">
            <div className={`progress-bar-fill ${type}`} style={{ width: `${displayPercentage}%` }} />
        </div>
    );
};

const StatCard = ({ title, value, goal, unit, type }) => {
    return (
        <div className="stat-card">
            <h3 className="stat-card-title">{title}</h3>
            <p className="stat-card-value">{Math.round(value)}</p>
            <p className="stat-card-goal">Goal: {goal} {unit}</p>
            <ProgressBar value={value} max={goal} type={type} />
        </div>
    );
};

const SimpleStatCard = ({title, value, unit, children}) => (
    <div className="stat-card stat-card-no-progress">
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-goal">{unit}</p>
        {children}
    </div>
);

const FoodLogItem = ({ log, token, onDeleted }) => {
    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/food-logs/${log.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete log.');
            onDeleted();
        } catch (error) {
            console.error("Error deleting log:", error);
        }
    };
    
    const calculatedCalories = (log.calories / 100) * log.grams;

    return (
        <li className="food-log-item">
            <div>
                <p className="food-log-item-name">{log.name}</p>
                <p className="food-log-item-details">{log.grams}g</p>
            </div>
            <p className="food-log-item-calories">{Math.round(calculatedCalories)} kcal</p>
            <button onClick={handleDelete} className="delete-log-button" title="Delete Log">
                <TrashIcon />
            </button>
        </li>
    );
};

const AddFoodModal = ({ isOpen, onClose, token, onFoodLogged }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isCustomEntry, setIsCustomEntry] = useState(false);
    const [grams, setGrams] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // New state for custom food entry
    const [customFood, setCustomFood] = useState({ name: '', calories: '', proteinG: '', carbsG: '', fatsG: '' });

    const debounceTimeout = useRef(null);

    const handleSearch = useCallback(async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods?q=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to search foods.');
            const data = await response.json();
            setSearchResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const handleSearchQueryChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            handleSearch(query);
        }, 300); 
    };

    const handleLogFood = async (e) => {
        e.preventDefault();
        if (!selectedFood) return;
        setIsLoading(true);
        setError('');
        try {
             const response = await fetch(`${API_BASE_URL}/api/food-logs`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ foodId: selectedFood.id, grams: parseInt(grams) })
            });
            if (!response.ok) throw new Error('Failed to log food.');
            onFoodLogged(); 
        } catch(err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleAddCustomFood = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods/custom`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...customFood,
                    calories: parseInt(customFood.calories),
                    proteinG: parseFloat(customFood.proteinG),
                    carbsG: parseFloat(customFood.carbsG),
                    fatsG: parseFloat(customFood.fatsG)
                })
            });
            const newFood = await response.json();
            if (!response.ok) throw new Error(newFood.message || 'Failed to add custom food');
            
            // Automatically select the new food for logging
            setSelectedFood(newFood);
            setIsCustomEntry(false);
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false);
        }
    }

    const resetState = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedFood(null);
        setGrams(100);
        setError('');
        setIsCustomEntry(false);
        setCustomFood({ name: '', calories: '', proteinG: '', carbsG: '', fatsG: '' });
    };
    
    useEffect(() => {
        if (isOpen) {
            resetState();
        }
    }, [isOpen]);
    
    const onModalClose = () => {
        resetState();
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onModalClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isCustomEntry ? 'Add a Custom Food' : (selectedFood ? `Log "${selectedFood.name}"` : 'Add Food to Diary')}
                    </h2>
                    <button onClick={onModalClose} className="modal-close-button">&times;</button>
                </div>
                
                {error && <div className="alert alert-error">{error}</div>}

                {isCustomEntry ? (
                    <form onSubmit={handleAddCustomFood} className="form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="custom-name">Food Name</label>
                            <input id="custom-name" type="text" value={customFood.name} onChange={e => setCustomFood({...customFood, name: e.target.value})} className="form-input" required />
                        </div>
                         <div className="form-group">
                            <label className="form-label" htmlFor="custom-calories">Calories (per 100g)</label>
                            <input id="custom-calories" type="number" value={customFood.calories} onChange={e => setCustomFood({...customFood, calories: e.target.value})} className="form-input" required />
                        </div>
                         <div className="form-group">
                            <label className="form-label" htmlFor="custom-protein">Protein (g)</label>
                            <input id="custom-protein" type="number" step="0.1" value={customFood.proteinG} onChange={e => setCustomFood({...customFood, proteinG: e.target.value})} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="custom-carbs">Carbs (g)</label>
                            <input id="custom-carbs" type="number" step="0.1" value={customFood.carbsG} onChange={e => setCustomFood({...customFood, carbsG: e.target.value})} className="form-input" required />
                        </div>
                         <div className="form-group">
                            <label className="form-label" htmlFor="custom-fats">Fats (g)</label>
                            <input id="custom-fats" type="number" step="0.1" value={customFood.fatsG} onChange={e => setCustomFood({...customFood, fatsG: e.target.value})} className="form-input" required />
                        </div>
                        <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                            <button type="button" className="form-button" style={{backgroundColor: 'var(--text-secondary-light)'}} onClick={() => setIsCustomEntry(false)}>
                                Back to Search
                            </button>
                            <button type="submit" className="form-button" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Food'}
                            </button>
                        </div>
                    </form>
                ) : !selectedFood ? (
                    <div>
                        <div className="form-group">
                            <label htmlFor="food-search" className="form-label">Search for a food</label>
                            <input
                                id="food-search"
                                type="text"
                                className="form-input"
                                placeholder="e.g., Roti, Paneer..."
                                value={searchQuery}
                                onChange={handleSearchQueryChange}
                                autoFocus
                            />
                        </div>
                        <ul className="search-results-list">
                            {isLoading && <li>Loading...</li>}
                            {searchResults.map(food => (
                                <li key={food.id} className="search-result-item" onClick={() => setSelectedFood(food)}>
                                    <p className="search-result-item-name">{food.name}</p>
                                    <p className="search-result-item-details">{food.calories} kcal per 100g</p>
                                </li>
                            ))}
                             {!isLoading && searchQuery.length > 2 && searchResults.length === 0 && (
                                <li className="search-result-item" onClick={() => {setIsCustomEntry(true); setCustomFood({ name: searchQuery, calories: '', proteinG: '', carbsG: '', fatsG: '' });}}>
                                    <p className="search-result-item-name">Can't find it? Add "{searchQuery}" as a new food</p>
                                </li>
                            )}
                        </ul>
                    </div>
                ) : (
                    <form onSubmit={handleLogFood}>
                         <div className="log-food-details">
                            <p><strong>{selectedFood.name}</strong></p>
                            <p>{selectedFood.calories} kcal per 100g</p>
                        </div>
                        <div className="form-group" style={{marginTop: '1rem'}}>
                            <label htmlFor="grams" className="form-label">Amount (grams)</label>
                            <input
                                id="grams"
                                type="number"
                                className="form-input"
                                value={grams}
                                onChange={e => setGrams(e.target.value)}
                                required
                                min="1"
                            />
                        </div>
                        <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                            <button type="button" className="form-button" style={{backgroundColor: 'var(--text-secondary-light)'}} onClick={() => setSelectedFood(null)}>
                                Back to Search
                            </button>
                            <button type="submit" className="form-button" disabled={isLoading}>
                                {isLoading ? 'Logging...' : 'Log Food'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const LogWaterModal = ({ isOpen, onClose, token, onWaterLogged }) => {
    const [amount, setAmount] = useState(250);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogWater = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/water-logs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount_ml: parseInt(amount) })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to log water.');
            }
            onWaterLogged();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            setAmount(250);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Log Water Intake</h2>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </div>
                
                {error && <div className="alert alert-error">{error}</div>}
                
                <form onSubmit={handleLogWater} className="form">
                    <div className="form-group">
                        <label htmlFor="water-amount" className="form-label">Amount (ml)</label>
                        <input
                            id="water-amount"
                            type="number"
                            className="form-input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="1"
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="form-button" style={{backgroundColor: 'var(--success-color)'}} disabled={isLoading}>
                        {isLoading ? 'Logging...' : 'Log Water'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const LogWeightModal = ({ isOpen, onClose, token, onWeightLogged }) => {
    const [weight, setWeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogWeight = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/weight-logs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ weight_kg: parseFloat(weight) })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to log weight.');
            }
            onWeightLogged();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            setWeight('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Log Your Weight</h2>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </div>
                
                {error && <div className="alert alert-error">{error}</div>}
                
                <form onSubmit={handleLogWeight} className="form">
                    <div className="form-group">
                        <label htmlFor="weight-amount" className="form-label">Current Weight (kg)</label>
                        <input
                            id="weight-amount"
                            type="number"
                            step="0.1"
                            className="form-input"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                            min="1"
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="form-button" style={{backgroundColor: 'var(--warning-color)'}} disabled={isLoading}>
                        {isLoading ? 'Logging...' : 'Log Weight'}
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- Dashboard Page ---
const DashboardPage = ({ userData, token, setPage, theme, setTheme, onNavigate, onLogout }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
    const [isLogWaterModalOpen, setIsLogWaterModalOpen] = useState(false);
    const [isLogWeightModalOpen, setIsLogWeightModalOpen] = useState(false);
    
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/today`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch dashboard data.');
            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleFoodLogged = () => {
        setIsAddFoodModalOpen(false);
        fetchDashboardData();
    };

    const handleWaterLogged = () => {
        setIsLogWaterModalOpen(false);
        fetchDashboardData();
    };

    const handleWeightLogged = () => {
        setIsLogWeightModalOpen(false);
        fetchDashboardData();
    };

    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    if (dashboardData?.foodLogs) {
        dashboardData.foodLogs.forEach(log => {
            const ratio = log.grams / 100;
            totals.calories += (log.calories || 0) * ratio;
            totals.protein += (log.proteinG || 0) * ratio;
            totals.carbs += (log.carbsG || 0) * ratio;
            totals.fats += (log.fatsG || 0) * ratio;
        });
    }

    const calculateBMI = () => {
        if (!userData.height_cm || !dashboardData?.latestWeight?.weight_kg) return '--';
        const heightM = userData.height_cm / 100;
        const bmi = dashboardData.latestWeight.weight_kg / (heightM * heightM);
        return bmi.toFixed(1);
    };

    if (isLoading && !dashboardData) {
        return <div className="loading-text">Loading Dashboard...</div>;
    }
    if (error) {
        return <div className="alert alert-error">Error: {error}</div>;
    }

    return (
        <div className="page-layout">
            <AddFoodModal 
                isOpen={isAddFoodModalOpen} 
                onClose={() => setIsAddFoodModalOpen(false)}
                token={token}
                onFoodLogged={handleFoodLogged}
            />
            <LogWaterModal
                isOpen={isLogWaterModalOpen}
                onClose={() => setIsLogWaterModalOpen(false)}
                token={token}
                onWaterLogged={handleWaterLogged}
            />
            <LogWeightModal
                isOpen={isLogWeightModalOpen}
                onClose={() => setIsLogWeightModalOpen(false)}
                token={token}
                onWeightLogged={handleWeightLogged}
            />

            <header className="page-header">
                <div className="header-content">
                    <Logo />
                    <div className="header-actions">
                        <span className="header-greeting">Hello, {userData.username || userData.email.split('@')[0]}</span>
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <button className="header-icon-button" onClick={() => onNavigate('history')} title="History & Trends">
                           <ChartIcon />
                        </button>
                        <button className="header-icon-button" onClick={() => onNavigate('settings')} title="Settings">
                           <SettingsIcon />
                        </button>
                        <button onClick={onLogout} className="logout-button">Logout</button>
                    </div>
                </div>
            </header>
            <main className="page-main">
                <h1 className="main-title">Today's Summary</h1>
                
                <div className="stats-grid">
                    <StatCard title="Calories" value={totals.calories} goal={userData.calorieGoal} unit="kcal" type="calories"/>
                    <StatCard title="Protein" value={totals.protein} goal={userData.proteinGoal} unit="g" type="protein"/>
                    <StatCard title="Carbs" value={totals.carbs} goal={userData.carbsGoal} unit="g" type="carbs"/>
                    <StatCard title="Fats" value={totals.fats} goal={userData.fatsGoal} unit="g" type="fats"/>
                    <StatCard title="Water" value={dashboardData?.totalWater || 0} goal={userData.waterGoal_ml} unit="ml" type="water" />
                    <SimpleStatCard title="Weight" value={dashboardData?.latestWeight?.weight_kg || '--'} unit="kg">
                       { (userData.height_cm && dashboardData?.latestWeight?.weight_kg) && 
                           <p className="stat-card-goal" style={{marginTop: '0.5rem'}}>BMI: {calculateBMI()}</p> 
                       }
                    </SimpleStatCard>
                </div>

                <div className="actions-container">
                    <button className="action-button add-food" onClick={() => setIsAddFoodModalOpen(true)}>Add Food</button>
                    <button className="action-button log-water" onClick={() => setIsLogWaterModalOpen(true)}>Log Water</button>
                    <button className="action-button log-weight" onClick={() => setIsLogWeightModalOpen(true)}>Log Weight</button>
                </div>

                <div className="food-log-section">
                    <h2 className="food-log-title">Logged Foods</h2>
                    {dashboardData?.foodLogs && dashboardData.foodLogs.length > 0 ? (
                        <ul className="food-log-list">
                            {dashboardData.foodLogs.map(log => (
                                <FoodLogItem key={log.id} log={log} token={token} onDeleted={fetchDashboardData} />
                            ))}
                        </ul>
                    ) : (
                        <p>No food logged yet today.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

// --- Settings Page ---
const SettingsPage = ({ userData, token, onNavigate, theme, setTheme, onLogout, onProfileUpdate }) => {
    const [formData, setFormData] = useState({ ...userData });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    useEffect(() => {
        setFormData(userData);
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update profile.');
            
            onProfileUpdate(formData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="page-layout">
            <header className="page-header">
                <div className="header-content">
                    <Logo />
                    <div className="header-actions">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <button className="header-icon-button" onClick={() => onNavigate('dashboard')} title="Dashboard">
                            <HomeIcon />
                        </button>
                        <button onClick={onLogout} className="logout-button">Logout</button>
                    </div>
                </div>
            </header>
            <main className="page-main">
                <h1 className="main-title">Profile & Settings</h1>
                <div className="stat-card" style={{maxWidth: '600px', margin: '0 auto'}}>
                     <form onSubmit={handleSave} className="form">
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        
                        <h2 className="food-log-title" style={{marginTop: 0, marginBottom: 0}}>Personal Info</h2>
                         <div className="form-group">
                            <label className="form-label" htmlFor="username">Username</label>
                            <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleInputChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="height_cm">Height (cm)</label>
                            <input type="number" name="height_cm" id="height_cm" value={formData.height_cm || ''} onChange={handleInputChange} className="form-input" />
                        </div>

                        <h2 className="food-log-title" style={{marginTop: '1rem', marginBottom: 0}}>Daily Goals</h2>
                        <div className="form-group">
                            <label className="form-label" htmlFor="calorieGoal">Calories (kcal)</label>
                            <input type="number" name="calorieGoal" id="calorieGoal" value={formData.calorieGoal} onChange={handleInputChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="proteinGoal">Protein (g)</label>
                            <input type="number" name="proteinGoal" id="proteinGoal" value={formData.proteinGoal} onChange={handleInputChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="carbsGoal">Carbohydrates (g)</label>
                            <input type="number" name="carbsGoal" id="carbsGoal" value={formData.carbsGoal} onChange={handleInputChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="fatsGoal">Fats (g)</label>
                            <input type="number" name="fatsGoal" id="fatsGoal" value={formData.fatsGoal} onChange={handleInputChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="waterGoal_ml">Water (ml)</label>
                            <input type="number" name="waterGoal_ml" id="waterGoal_ml" value={formData.waterGoal_ml} onChange={handleInputChange} className="form-input" />
                        </div>

                        <button type="submit" className="form-button" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};


// --- History Page ---
const HistoryPage = ({ userData, token, onNavigate, theme, setTheme, onLogout }) => {
    const [weightData, setWeightData] = useState([]);
    const [macroData, setMacroData] = useState([]);
    const [range, setRange] = useState('7'); // '7', '30', 'all'
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/history?range=${range}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                 if (!response.ok) {
                    throw new Error('Failed to fetch history data.');
                }
                const data = await response.json();

                const formattedWeights = data.weights.map(log => ({
                    date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    Weight: log.weight_kg
                })).sort((a,b) => new Date(a.date) - new Date(b.date));
                setWeightData(formattedWeights);
                
                const formattedMacros = Object.keys(data.macros).map(date => ({
                    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    Calories: Math.round(data.macros[date].calories),
                    Protein: Math.round(data.macros[date].protein),
                    Carbs: Math.round(data.macros[date].carbs),
                    Fats: Math.round(data.macros[date].fats),
                })).sort((a,b) => new Date(a.date) - new Date(b.date));
                setMacroData(formattedMacros);

            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [token, range]);

    return (
        <div className="page-layout">
            <header className="page-header">
                <div className="header-content">
                    <Logo />
                    <div className="header-actions">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <button className="header-icon-button" onClick={() => onNavigate('dashboard')} title="Dashboard">
                           <HomeIcon />
                        </button>
                        <button className="header-icon-button" onClick={() => onNavigate('settings')} title="Settings">
                           <SettingsIcon />
                        </button>
                        <button onClick={onLogout} className="logout-button">Logout</button>
                    </div>
                </div>
            </header>
            <main className="page-main">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1 className="main-title">History & Trends</h1>
                    <div className="range-selector">
                        <button onClick={() => setRange('7')} className={`range-button ${range === '7' ? 'active' : ''}`}>7 Days</button>
                        <button onClick={() => setRange('30')} className={`range-button ${range === '30' ? 'active' : ''}`}>30 Days</button>
                        <button onClick={() => setRange('all')} className={`range-button ${range === 'all' ? 'active' : ''}`}>All Time</button>
                    </div>
                </div>
                
                {isLoading ? <div className="loading-text">Loading History...</div> : (
                <div className="page-grid">
                    <div className="stat-card">
                        <h2 className="food-log-title" style={{marginTop: 0}}>Weight Trend (kg)</h2>
                        <div style={{width: '100%', height: '300px'}}>
                           <WeightChart data={weightData} theme={theme} />
                        </div>
                    </div>
                    <div className="stat-card">
                         <h2 className="food-log-title" style={{marginTop: 0}}>Daily Macros (g) & Calories</h2>
                         <div style={{width: '100%', height: '300px'}}>
                            <MacroHistoryChart data={macroData} theme={theme} />
                         </div>
                    </div>
                </div>
                )}
            </main>
        </div>
    );
};


// --- Chart Components ---
const WeightChart = ({ data, theme }) => {
    const isChartReady = !!window.Recharts; 
    if (!isChartReady) return <div className="loading-text">Loading Chart...</div>;
    
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = window.Recharts;
    const strokeColor = theme === 'dark' ? '#9ca3af' : '#4b5563';
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} strokeOpacity={0.5} />
                <XAxis dataKey="date" stroke={strokeColor} />
                <YAxis stroke={strokeColor} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                    }}
                />
                <Line type="monotone" dataKey="Weight" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

const MacroHistoryChart = ({ data, theme }) => {
    const isChartReady = !!window.Recharts; 
    if (!isChartReady) return <div className="loading-text">Loading Chart...</div>;
    
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts;
    const strokeColor = theme === 'dark' ? '#9ca3af' : '#4b5563';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} strokeOpacity={0.5}/>
                <XAxis dataKey="date" stroke={strokeColor}/>
                <YAxis stroke={strokeColor}/>
                <Tooltip 
                    contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                    }}
                />
                <Legend />
                <Bar dataKey="Protein" stackId="a" fill="var(--danger-color)" />
                <Bar dataKey="Carbs" stackId="a" fill="var(--warning-color)" />
                <Bar dataKey="Fats" stackId="a" fill="var(--purple-color)" />
                 <Bar dataKey="Calories" fill="var(--accent-color)" />
            </BarChart>
        </ResponsiveContainer>
    );
};

// ========= MAIN APP COMPONENT =========
export default function App() {
    useScript('https://unpkg.com/recharts/umd/Recharts.min.js');
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    
    const [page, setPage] = useState('login');
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUserData(JSON.parse(storedUser));
            setPage('dashboard');
        }
    }, []);

    const handleSetToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('authToken', newToken);
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
    };
    
    const handleSetUserData = (newUserData) => {
        setUserData(newUserData);
         if (newUserData) {
            localStorage.setItem('userData', JSON.stringify(newUserData));
        } else {
            localStorage.removeItem('userData');
        }
    }
    
    const handleLogout = () => {
        handleSetToken(null);
        handleSetUserData(null);
        setPage('login');
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const renderPage = () => {
        switch (page) {
            case 'register':
                return <RegisterPage setPage={setPage} />;
            case 'dashboard':
                return token 
                    ? <DashboardPage userData={userData} token={token} setPage={setPage} theme={theme} setTheme={setTheme} onNavigate={setPage} onLogout={handleLogout} /> 
                    : <LoginPage setPage={setPage} setToken={handleSetToken} setUserData={handleSetUserData} />;
            case 'settings':
                 return token 
                    ? <SettingsPage userData={userData} token={token} onNavigate={setPage} theme={theme} setTheme={setTheme} onLogout={handleLogout} onProfileUpdate={handleSetUserData} /> 
                    : <LoginPage setPage={setPage} setToken={handleSetToken} setUserData={handleSetUserData} />;
            case 'history':
                 return token 
                    ? <HistoryPage userData={userData} token={token} onNavigate={setPage} theme={theme} setTheme={setTheme} onLogout={handleLogout} /> 
                    : <LoginPage setPage={setPage} setToken={handleSetToken} setUserData={handleSetUserData} />;
            case 'login':
            default:
                return <LoginPage setPage={setPage} setToken={handleSetToken} setUserData={handleSetUserData} />;
        }
    };

    const showAuthPages = page === 'login' || page === 'register';

    return (
        <div className="app-container">
            <GlobalStyles />
            {showAuthPages && (
                 <div className="theme-toggle-container">
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
            )}
            {renderPage()}
        </div>
    );
}
