import { useCallback, useState } from 'react';

import * as authService from '../services/authService';

// The session for the screens. It starts logged out, as before; the mock session
// is not persisted, so there is nothing to restore on load.
export function useAuth() {
  const [session, setSession] = useState(null);

  const login = useCallback(async () => {
    setSession(await authService.login());
  }, []);

  const logout = useCallback(async () => {
    setSession(await authService.logout());
  }, []);

  return { session, isLoggedIn: Boolean(session), login, logout };
}
