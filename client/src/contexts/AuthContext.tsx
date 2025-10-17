import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthState, User } from "../lib/types";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase-config";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };

    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    // subscribe to firebase auth state
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const currentUser: User = {
          uid: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName || "",
          displayPicture: fbUser.photoURL || undefined,
        };
        sessionStorage.setItem("user", JSON.stringify(currentUser));
        dispatch({ type: "SET_USER", payload: currentUser });
      } else {
        sessionStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
      }
    });
    return () => unsub();
  }, []);

  // const login = async (email: string, password: string) => {
  //   dispatch({ type: "SET_LOADING", payload: true });

  //   // Simulate API call
  //   await new Promise((resolve) => setTimeout(resolve, 1500));

  //   sessionStorage.setItem("user", JSON.stringify(mockUser));
  //   dispatch({ type: "SET_USER", payload: mockUser });
  // };

  const loginWithGoogle = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const currentUser: User = {
        uid: fbUser.uid,
        email: fbUser.email || "",
        name: fbUser.displayName || "",
        displayPicture: fbUser.photoURL || undefined,
      };
      sessionStorage.setItem("user", JSON.stringify(currentUser));
      dispatch({ type: "SET_USER", payload: currentUser });
    } catch (err) {
      console.error("Google sign-in error:", err);
      throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loginWithMicrosoft = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const provider = new OAuthProvider("microsoft.com");
      provider.addScope("User.Read");
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const currentUser: User = {
        uid: fbUser.uid,
        email: fbUser.email || "",
        name: fbUser.displayName || "",
        displayPicture: fbUser.photoURL || undefined,
      };
      sessionStorage.setItem("user", JSON.stringify(currentUser));
      dispatch({ type: "SET_USER", payload: currentUser });
    } catch (err) {
      console.error("Microsoft sign-in error:", err);
      throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;
      const currentUser: User = {
        uid: fbUser.uid,
        email: fbUser.email || "",
        name: fbUser.displayName || "",
        displayPicture: fbUser.photoURL || undefined,
      };
      sessionStorage.setItem("user", JSON.stringify(currentUser));
      dispatch({ type: "SET_USER", payload: currentUser });
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (err instanceof Error) throw err;
      throw new Error("Login failed");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;
      if (name) {
        try {
          await updateProfile(fbUser, { displayName: name });
        } catch (e) {
          // non-fatal
          console.warn("updateProfile failed:", e);
        }
      }

      const currentUser: User = {
        uid: fbUser.uid,
        email: fbUser.email || "",
        name: name || fbUser.displayName || "",
        displayPicture: fbUser.photoURL || undefined,
      };
      sessionStorage.setItem("user", JSON.stringify(currentUser));
      dispatch({ type: "SET_USER", payload: currentUser });
    } catch (err: unknown) {
      console.error("Register error:", err);
      // Provide a clearer message when Email/Password sign-in is not enabled in Firebase
      const getErrorCode = (e: unknown): string | null => {
        if (!e) return null;
        // Firebase errors often have a 'code' string, otherwise use message
        if (typeof e === "object" && e !== null) {
          const maybe = e as { code?: unknown; message?: unknown };
          if (typeof maybe.code === "string") return maybe.code;
          if (typeof maybe.message === "string") return maybe.message;
        }
        return null;
      };
      const code = getErrorCode(err);
      if (code === "auth/configuration-not-found") {
        throw new Error(
          "Email/Password sign-in is not enabled for this Firebase project. Enable it in the Firebase Console: Authentication → Sign-in method → Email/Password."
        );
      }
      if (err instanceof Error) throw err;
      throw new Error("Register failed");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await signOut(auth);
      sessionStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    } catch (err) {
      console.error("Logout error:", err);
      throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithGoogle,
        loginWithMicrosoft,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
