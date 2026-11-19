// Simulated login. The session lives in memory only, so a page reload logs out,
// as before. DigiD or another provider replaces these functions later; screens
// only use them through useAuth.
const MOCK_SESSION = { user: 'demo' };

let session = null;

export const getSession = async () => (session ? { ...session } : null);

export const login = async () => {
  session = { ...MOCK_SESSION };
  return { ...session };
};

export const logout = async () => {
  session = null;
  return null;
};

export const resetSessionForTests = () => {
  session = null;
};
