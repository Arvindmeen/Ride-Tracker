import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

export default function UserSettingsPage() {
  const [params] = useSearchParams();
  const tab = params.get('tab') || 'preferences';
  return <Navigate to={`/app/profile?tab=${tab}`} replace />;
}
