import React from 'react';

/**
 * Reusable Button Component
 * @param {string} variant - 'primary', 'secondary', 'danger', 'success', 'disabled'
 * @param {string} size - 'small', 'medium', 'large'
 * @param {ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {string} icon - Icon to display (emoji or text)
 * @param {object} style - Additional inline styles
 */
export default function Button({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  onClick, 
  disabled = false, 
  icon = null, 
  style = {},
  ...props 
}) {
  const getBaseStyle = () => {
    const baseStyle = {
      border: 'none',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: icon ? '8px' : '0',
      outline: 'none'
    };

    // Size variants
    const sizeStyles = {
      small: { padding: '8px 12px', fontSize: '14px' },
      medium: { padding: '12px 20px', fontSize: '16px' },
      large: { padding: '16px 24px', fontSize: '18px' }
    };

    // Color variants
    const variantStyles = {
      primary: {
        background: disabled ? '#d1d5db' : '#3b82f6',
        color: disabled ? '#9ca3af' : 'white'
      },
      secondary: {
        background: disabled ? '#d1d5db' : '#6b7280',
        color: disabled ? '#9ca3af' : 'white'
      },
      success: {
        background: disabled ? '#d1d5db' : '#10b981',
        color: disabled ? '#9ca3af' : 'white'
      },
      danger: {
        background: disabled ? '#d1d5db' : '#ef4444',
        color: disabled ? '#9ca3af' : 'white'
      },
      warning: {
        background: disabled ? '#d1d5db' : '#f59e0b',
        color: disabled ? '#9ca3af' : 'white'
      },
      disabled: {
        background: '#d1d5db',
        color: '#9ca3af',
        cursor: 'not-allowed'
      },
      outline: {
        background: 'transparent',
        color: disabled ? '#9ca3af' : '#3b82f6',
        border: `1px solid ${disabled ? '#d1d5db' : '#3b82f6'}`
      }
    };

    return {
      ...baseStyle,
      ...(sizeStyles[size] || sizeStyles.medium),
      ...(variantStyles[variant] || variantStyles.primary),
      ...style
    };
  };

  return (
    <button
      style={getBaseStyle()}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}