// ==============================
// TIME MANAGER - TYPESCRIPT STYLES
// ==============================

import { CSSProperties } from 'react';

// ==============================
// GLOBAL STYLES
// ==============================

export const globalStyles = {
  fontImport: '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");',
  
  body: {
    fontFamily: "'Inter', sans-serif",
    margin: 0,
    padding: 0,
    background: '#f8fafc',
    boxSizing: 'border-box'
  } as CSSProperties
};

// ==============================
// LOGIN STYLES
// ==============================

export const loginStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%'
  } as CSSProperties,

  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px'
  } as CSSProperties,

  header: {
    textAlign: 'center',
    marginBottom: '32px'
  } as CSSProperties,

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '8px'
  } as CSSProperties,

  logoIcon: {
    fontSize: '32px'
  } as CSSProperties,

  appTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0
  } as CSSProperties,

  appSubtitle: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 400,
    margin: 0
  } as CSSProperties,

  form: {
    marginBottom: '24px'
  } as CSSProperties,

  formGroup: {
    marginBottom: '20px'
  } as CSSProperties,

  inputLabel: {
    display: 'block',
    color: '#374151',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px'
  } as CSSProperties,

  inputField: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '0',
    fontSize: '16px',
    color: '#374151',
    background: 'white',
    transition: 'all 0.2s ease',
    outline: 'none'
  } as CSSProperties,

  inputFieldFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  } as CSSProperties,

  forgotPasswordBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '8px',
    padding: '4px 0',
    textAlign: 'left',
    transition: 'color 0.2s ease'
  } as CSSProperties,

  loginButton: {
    width: '100%',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '0',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '8px'
  } as CSSProperties,

  loginButtonHover: {
    background: '#4338ca'
  } as CSSProperties,

  errorMessage: {
    color: '#dc2626',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '16px',
    padding: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px'
  } as CSSProperties,

  demoAccounts: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px',
    marginTop: '24px'
  } as CSSProperties,

  demoTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6b7280',
    margin: '0 0 12px 0'
  } as CSSProperties,

  demoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  } as CSSProperties,

  demoItem: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0
  } as CSSProperties
};

// ==============================
// DASHBOARD STYLES
// ==============================

export const dashboardStyles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start'
  } as CSSProperties,

  header: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center', 
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '1200px'
  } as CSSProperties,

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  } as CSSProperties,

  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontSize: 'inherit',
    fontFamily: 'inherit'
  } as CSSProperties,

  logoSectionHover: {
    background: '#f1f5f9',
    transform: 'translateY(-1px)'
  } as CSSProperties,

  logoIcon: {
    fontSize: '24px'
  } as CSSProperties,

  appName: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e293b'
  } as CSSProperties,

  userRole: {
    background: '#10b981',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600
  } as CSSProperties,

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  } as CSSProperties,

  userInfo: {
    color: '#64748b',
    fontSize: '14px'
  } as CSSProperties,

  editProfileBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px'
  } as CSSProperties,

  logoutBtn: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  } as CSSProperties,

  nav: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 24px',
    display: 'flex',
    gap: 0,
    width: '100%',
    maxWidth: '1200px'
  } as CSSProperties,

  navTab: {
    background: 'none',
    border: 'none',
    padding: '16px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#64748b',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  } as CSSProperties,

  navTabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
    background: '#f1f5f9'
  } as CSSProperties,

  navTabHover: {
    color: '#3b82f6',
    background: '#f1f5f9'
  } as CSSProperties,

  main: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  } as CSSProperties,

  contentContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  } as CSSProperties
};

// ==============================
// POINTAGE STYLES
// ==============================

export const pointageStyles = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh'
  } as CSSProperties,

  content: {
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto'
  } as CSSProperties,

  timeDisplay: {
    marginBottom: '32px'
  } as CSSProperties,

  currentTime: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px'
  } as CSSProperties,

  currentDate: {
    fontSize: '16px',
    color: '#64748b'
  } as CSSProperties,

  statusDisplay: {
    marginBottom: '32px'
  } as CSSProperties,

  statusLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '8px'
  } as CSSProperties,

  statusValue: {
    fontSize: '18px',
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: '8px',
    display: 'inline-block'
  } as CSSProperties,

  statusAbsent: {
    color: '#dc2626',
    background: '#fef2f2'
  } as CSSProperties,

  statusPresent: {
    color: '#059669',
    background: '#ecfdf5'
  } as CSSProperties,

  dailyHoursDisplay: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '32px',
    border: '1px solid #e2e8f0'
  } as CSSProperties,

  hoursLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '8px'
  } as CSSProperties,

  hoursValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '12px'
  } as CSSProperties,

  timeDetails: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    fontSize: '14px',
    color: '#64748b'
  } as CSSProperties,

  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px'
  } as CSSProperties,

  btnBase: {
    padding: '16px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  } as CSSProperties,

  btnArrivee: {
    background: '#10b981',
    color: 'white'
  } as CSSProperties,

  btnDepart: {
    background: '#ec4899',
    color: 'white'
  } as CSSProperties,

  btnDisabled: {
    background: '#d1d5db',
    color: '#9ca3af',
    cursor: 'not-allowed'
  } as CSSProperties,

  reminder: {
    color: '#3b82f6',
    fontSize: '14px',
    padding: '16px',
    background: '#eff6ff',
    borderRadius: '8px',
    borderLeft: '4px solid #3b82f6'
  } as CSSProperties
};

// ==============================
// RESUME STYLES
// ==============================

export const resumeStyles = {
  container: {
    padding: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100%'
  } as CSSProperties,

  title: {
    fontSize: '24px',
    color: '#1e293b',
    marginBottom: '24px',
    fontWeight: 600
  } as CSSProperties,

  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '32px'
  } as CSSProperties,

  card: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  } as CSSProperties,

  cardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  } as CSSProperties,

  cardIcon: {
    fontSize: '24px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    borderRadius: '8px'
  } as CSSProperties,

  cardContent: {
    flex: 1
  } as CSSProperties,

  cardLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '4px'
  } as CSSProperties,

  cardValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b'
  } as CSSProperties,

  cardValueOvertime: {
    color: '#f59e0b'
  } as CSSProperties,

  weekDetail: {
    marginTop: '32px'
  } as CSSProperties,

  weekTitle: {
    fontSize: '18px',
    color: '#1e293b',
    marginBottom: '20px',
    fontWeight: 600
  } as CSSProperties,

  weekDays: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  } as CSSProperties,

  dayRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s'
  } as CSSProperties,

  dayRowHover: {
    background: '#f9fafb'
  } as CSSProperties,

  dayInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '120px'
  } as CSSProperties,

  dayIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#e2e8f0'
  } as CSSProperties,

  dayIndicatorActive: {
    background: '#10b981'
  } as CSSProperties,

  dayName: {
    fontWeight: 500,
    color: '#1e293b'
  } as CSSProperties,

  dayTimes: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: 1,
    justifyContent: 'flex-end'
  } as CSSProperties,

  timeRange: {
    color: '#64748b',
    fontFamily: 'monospace',
    fontSize: '14px',
    minWidth: '120px'
  } as CSSProperties,

  hoursWorked: {
    fontWeight: 500,
    color: '#1e293b',
    minWidth: '80px',
    textAlign: 'right'
  } as CSSProperties,

  overtime: {
    color: '#10b981',
    fontWeight: 500,
    minWidth: '70px',
    textAlign: 'right',
    fontSize: '14px'
  } as CSSProperties,

  overtimeSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '16px 20px',
    background: '#f1f5f9',
    borderRadius: '8px',
    borderLeft: '4px solid #3b82f6'
  } as CSSProperties,

  overtimeText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  } as CSSProperties,

  overtimeLabel: {
    fontWeight: 600,
    color: '#3b82f6',
    fontSize: '14px'
  } as CSSProperties,

  overtimeNote: {
    fontSize: '12px',
    color: '#64748b'
  } as CSSProperties,

  overtimeTotal: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#3b82f6'
  } as CSSProperties,

  // Styles pour le statut de ponctualité
  attendanceStatus: {
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
    marginLeft: '8px',
    marginRight: '8px'
  } as CSSProperties,

  attendanceStatusOnTime: {
    background: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0'
  } as CSSProperties,

  attendanceStatusLate: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5'
  } as CSSProperties
};

// ==============================
// HISTORY STYLES
// ==============================

export const historyStyles = {
  container: {
    padding: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100%'
  } as CSSProperties,

  content: {
    maxWidth: '1000px',
    margin: '0 auto'
  } as CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  } as CSSProperties,

  title: {
    fontSize: '24px',
    color: '#1e293b',
    fontWeight: 600,
    margin: 0
  } as CSSProperties,

  monthSelector: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: 'white',
    color: '#374151',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  } as CSSProperties,

  monthSelectorFocus: {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  } as CSSProperties,

  tableContainer: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  } as CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  } as CSSProperties,

  th: {
    background: '#f8fafc',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e5e7eb'
  } as CSSProperties,

  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
    color: '#374151'
  } as CSSProperties,

  trHover: {
    background: '#f9fafb'
  } as CSSProperties,

  overtimeCell: {
    color: '#10b981',
    fontWeight: 500
  } as CSSProperties,

  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500
  } as CSSProperties,

  statusBadgeComplete: {
    background: '#d1fae5',
    color: '#065f46'
  } as CSSProperties,

  statusBadgeDelay: {
    background: '#fed7aa',
    color: '#9a3412'
  } as CSSProperties,

  statusBadgeIncomplete: {
    background: '#fee2e2',
    color: '#991b1b'
  } as CSSProperties,

  monthlySummary: {
    marginTop: '32px'
  } as CSSProperties,

  summaryTitle: {
    fontSize: '18px',
    color: '#1e293b',
    marginBottom: '20px',
    fontWeight: 600
  } as CSSProperties,

  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px'
  } as CSSProperties,

  summaryCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  } as CSSProperties,

  summaryCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  } as CSSProperties,

  summaryNumber: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '4px'
  } as CSSProperties,

  summaryNumberOvertime: {
    color: '#10b981'
  } as CSSProperties,

  summaryNumberDelay: {
    color: '#ef4444'
  } as CSSProperties,

  summaryLabel: {
    fontSize: '14px',
    color: '#64748b'
  } as CSSProperties
};

// ==============================
// PROFILE STYLES
// ==============================

export const profileStyles = {
  container: {
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100%'
  } as CSSProperties,

  content: {
    width: '100%',
    maxWidth: '700px'
  } as CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px'
  } as CSSProperties,

  backBtn: {
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  } as CSSProperties,

  title: {
    fontSize: '24px',
    color: '#1e293b',
    fontWeight: 600,
    margin: 0
  } as CSSProperties,

  successMessage: {
    background: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: 500
  } as CSSProperties,

  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: '24px'
  } as CSSProperties,

  cardHeader: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  } as CSSProperties,

  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  } as CSSProperties,

  avatarIcon: {
    fontSize: '24px',
    color: '#64748b'
  } as CSSProperties,

  userInfo: {
    flex: 1
  } as CSSProperties,

  userName: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 4px 0'
  } as CSSProperties,

  userRole: {
    color: '#64748b',
    fontSize: '14px',
    background: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: '12px',
    display: 'inline-block'
  } as CSSProperties,

  editBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  } as CSSProperties,

  form: {
    padding: '24px'
  } as CSSProperties,

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  } as CSSProperties,

  formGroup: {
    marginBottom: '20px'
  } as CSSProperties,

  label: {
    display: 'block',
    color: '#374151',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px'
  } as CSSProperties,

  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    color: '#374151',
    background: 'white',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  } as CSSProperties,

  inputDisabled: {
    background: '#f9fafb',
    color: '#6b7280',
    cursor: 'not-allowed'
  } as CSSProperties,

  inputError: {
    borderColor: '#dc2626',
    boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)'
  } as CSSProperties,

  errorText: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block'
  } as CSSProperties,

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid #e2e8f0',
    background: '#f9fafb'
  } as CSSProperties,

  cancelBtn: {
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  } as CSSProperties,

  saveBtn: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  } as CSSProperties,

  infoCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    padding: '24px'
  } as CSSProperties,

  infoTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 16px 0'
  } as CSSProperties,

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9'
  } as CSSProperties,

  infoLabel: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 500
  } as CSSProperties,

  infoValue: {
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: 500
  } as CSSProperties
};

// ==============================
// RESPONSIVE BREAKPOINTS
// ==============================

export const responsive = {
  mobile: '@media (max-width: 480px)',
  tablet: '@media (max-width: 768px)',
  desktop: '@media (min-width: 769px)'
};

// ==============================
// UTILITY FUNCTIONS
// ==============================

export const mergeStyles = (...styles: CSSProperties[]): CSSProperties => {
  return Object.assign({}, ...styles);
};

export const createHoverStyle = (baseStyle: CSSProperties, hoverStyle: CSSProperties) => ({
  base: baseStyle,
  hover: mergeStyles(baseStyle, hoverStyle)
});

// ==============================
// EXPORT ALL STYLES
// ==============================

export default {
  global: globalStyles,
  login: loginStyles,
  dashboard: dashboardStyles,
  pointage: pointageStyles,
  resume: resumeStyles,
  history: historyStyles,
  profile: profileStyles,
  responsive,
  mergeStyles,
  createHoverStyle
};