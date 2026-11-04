import React from 'react';
import PreferencesForm from '../components/PreferencesForm';

export default function PreferencesPage() {
  return (
    <div className="page-container animation-fade-in">
      <div className="page-header">
        <h2>Dietary Preferences</h2>
        <p className="text-muted">Set your calorie goals and dietary restrictions here.</p>
      </div>
      <PreferencesForm />
    </div>
  );
}
