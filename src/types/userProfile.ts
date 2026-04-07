export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  notificationsEnabled: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  bio: '',
  notificationsEnabled: false,
};
