import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'local_auth_users';
const SESSION_KEY = 'local_auth_session';

type LocalUser = {
  id: string;
  email: string;
  password: string;
  display_name: string;
};

type LocalSession = {
  user: {
    id: string;
    email: string;
    user_metadata: { display_name: string };
  };
};

const getUsers = async (): Promise<LocalUser[]> => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveUsers = (users: LocalUser[]) =>
  AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

export const localAuth = {
  async getSession(): Promise<LocalSession | null> {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async signUp(email: string, password: string, displayName: string): Promise<{ error: string | null }> {
    const users = await getUsers();
    if (users.find((u) => u.email === email)) {
      return { error: 'このメールアドレスは既に登録されています' };
    }
    const newUser: LocalUser = {
      id: Date.now().toString(),
      email,
      password,
      display_name: displayName,
    };
    await saveUsers([...users, newUser]);
    return { error: null };
  },

  async signIn(email: string, password: string): Promise<{ session: LocalSession | null; error: string | null }> {
    const users = await getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return { session: null, error: 'メールアドレスまたはパスワードが違います' };
    }
    const session: LocalSession = {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { display_name: user.display_name },
      },
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { session, error: null };
  },

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
  },
};
