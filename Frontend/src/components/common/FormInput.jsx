import React from 'react';

/**
 * Reusable Form Input Component
 * @param {string} label - Input label
 * @param {string} type - Input type
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Required field
 * @param {boolean} disabled - Disabled state
 * @param {string} error - Error message
 * @param {object} style - Additional styles
 */
export default function FormInput({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  disabled = false, 
  error, 
  style = {},
  ...props 
}) {
  const containerStyle = {
    marginBottom: '20px',
    ...style
  };

  const labelStyle = {
    display: 'block',
    color: '#374151',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
    borderRadius: '6px',
    fontSize: '16px',
    color: disabled ? '#6b7280' : '#374151',
    background: disabled ? '#f9fafb' : 'white',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'text'
  };

  const errorStyle = {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block'
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: '#dc2626' }}> *</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={inputStyle}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}