import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check if this is a short URL request
const path = window.location.pathname;
const shortUrlMatch = path.match(/^\/([A-Za-z0-9_-]+)$/);

async function handleRedirect(id: string) {
  try {
    if (typeof window === 'undefined') return;

    console.log('Handling redirect for ID:', id);

    const response = await fetch(`http://localhost:3001/api/urls/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        showErrorPage('This short URL does not exist or has been removed.');
      } else {
        showErrorPage('An unexpected error occurred. Please try again later.');
      }
      return;
    }

    const data = await response.json();
    if (!data.original_url) {
      console.error('No URL found for ID:', id);
      showErrorPage('This short URL does not exist or has been removed.');
      return;
    }

    console.log('Found URL:', data.original_url);

    // Validate the URL before redirecting
    let url: URL;
    try {
      url = new URL(data.original_url);
      if (!url.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol');
      }
    } catch (urlError) {
      console.error('URL validation error:', urlError instanceof Error ? urlError.message : 'Invalid URL');
      showErrorPage('The destination URL is invalid or malformed.');
      return;
    }

    // Perform the redirect
    console.log('Redirecting to:', url.href);
    window.location.replace(url.href);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Unhandled error in handleRedirect:', errorMessage);
    showErrorPage('An unexpected error occurred. Please try again later.');
  }
}

function showErrorPage(message: string) {
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
      background-color: #f9fafb;
      padding: 20px;
    ">
      <div style="
        background-color: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        max-width: 28rem;
        width: 100%;
      ">
        <h1 style="
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        ">URL Error</h1>
        <p style="
          color: #4b5563;
          margin-bottom: 1.5rem;
        ">${message}</p>
        <a href="/"
          style="
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.backgroundColor='#2563eb'"
          onmouseout="this.style.backgroundColor='#3b82f6'"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  `;
}

// Initialize the app based on the URL
if (shortUrlMatch) {
  const id = shortUrlMatch[1];
  console.log('Short URL detected, ID:', id);
  handleRedirect(id);
} else {
  // Regular app rendering
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}