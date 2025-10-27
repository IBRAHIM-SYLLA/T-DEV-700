import React from 'react';

/**
 * Reusable Status Badge Component
 * @param {string} status - Status text
 * @param {string} variant - 'success', 'warning', 'danger', 'info'
 * @param {object} style - Additional styles
 */
export default function StatusBadge({ status, variant = 'info', style = {} }) {
  const getVariantStyle = () => {
    const variants = {
      success: {
        background: '#dcfce7',
        color: '#166534',
        border: '1px solid #bbf7d0'
      },
      warning: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fcd34d'
      },
      danger: {
        background: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fca5a5'
      },
      info: {
        background: '#e0f2fe',
        color: '#0369a1',
        border: '1px solid #7dd3fc'
      },
      late: {
        background: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fca5a5'
      }
    };

    return variants[variant] || variants.info;
  };

  const badgeStyle = {
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
    ...getVariantStyle(),
    ...style
  };

  return (
    <span style={badgeStyle}>
      {status}
    </span>
  );
}