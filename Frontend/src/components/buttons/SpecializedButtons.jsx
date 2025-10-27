import React from 'react';
import Button from './Button';

/**
 * Specialized Pointage Buttons
 */

export function ClockInButton({ onClick, disabled, isWorking }) {
  return (
    <Button
      variant={disabled ? 'disabled' : 'success'}
      size="large"
      onClick={onClick}
      disabled={disabled}
      icon="📍"
    >
      Pointer l'arrivée
    </Button>
  );
}

export function ClockOutButton({ onClick, disabled }) {
  return (
    <Button
      variant={disabled ? 'disabled' : 'danger'}
      size="large"
      onClick={onClick}
      disabled={disabled}
      icon="📍"
    >
      Pointer le départ
    </Button>
  );
}

/**
 * Authentication Buttons
 */
export function LoginButton({ onClick, disabled, loading = false }) {
  return (
    <Button
      variant="primary"
      size="large"
      onClick={onClick}
      disabled={disabled || loading}
      style={{ width: '100%', marginTop: '8px' }}
    >
      {loading ? 'Connexion...' : 'Se connecter'}
    </Button>
  );
}

export function LogoutButton({ onClick }) {
  return (
    <Button
      variant="danger"
      size="medium"
      onClick={onClick}
    >
      Déconnexion
    </Button>
  );
}

/**
 * Profile & Navigation Buttons
 */
export function EditProfileButton({ onClick }) {
  return (
    <Button
      variant="primary"
      size="medium"
      onClick={onClick}
      icon="✏️"
    >
      Profil
    </Button>
  );
}

export function BackButton({ onClick, text = "Retour" }) {
  return (
    <Button
      variant="outline"
      size="medium"
      onClick={onClick}
      icon="←"
    >
      {text}
    </Button>
  );
}

export function SaveButton({ onClick, disabled = false, loading = false }) {
  return (
    <Button
      variant="success"
      size="medium"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
    </Button>
  );
}

export function CancelButton({ onClick }) {
  return (
    <Button
      variant="outline"
      size="medium"
      onClick={onClick}
    >
      Annuler
    </Button>
  );
}