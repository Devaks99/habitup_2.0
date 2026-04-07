import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types/userProfile';
import { DEFAULT_PROFILE } from '@/types/userProfile';

const PROFILE_KEY = 'habits-app-profile';

function loadProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  return { profile, updateProfile };
}
