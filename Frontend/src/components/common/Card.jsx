import React from 'react';

/**
 * Reusable Card Component
 * @param {ReactNode} children - Card content
 * @param {string} title - Optional card title
 * @param {string} icon - Optional icon
 * @param {function} onClick - Optional click handler
 * @param {object} style - Additional styles
 * @param {boolean} hoverable - Enable hover effects
 */
export default function Card({ 
  children, 
  title, 
  icon, 
  onClick, 
  style = {}, 
  hoverable = false,
  ...props 
}) {
  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    transition: hoverable ? 'transform 0.2s, box-shadow 0.2s' : 'none',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  const hoverStyle = hoverable ? {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }
  } : {};

  const headerStyle = {
    padding: '24px 24px 0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0
  };

  const contentStyle = {
    padding: title ? '16px 24px 24px 24px' : '24px'
  };

  return (
    <div 
      style={cardStyle} 
      onClick={onClick}
      {...props}
    >
      {(title || icon) && (
        <div style={headerStyle}>
          {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
          {title && <h3 style={titleStyle}>{title}</h3>}
        </div>
      )}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
}