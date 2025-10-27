import React from 'react';

/**
 * Reusable Loading Spinner Component
 * @param {string} size - 'small', 'medium', 'large'
 * @param {string} color - Color of the spinner
 * @param {string} text - Optional loading text
 */
export default function LoadingSpinner({ size = 'medium', color = '#3b82f6', text }) {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `2px solid #f3f4f6`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  };

  const textStyle = {
    fontSize: '14px',
    color: '#6b7280'
  };

  // Add CSS animation for spinner
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {text && <span style={textStyle}>{text}</span>}
    </div>
  );
}