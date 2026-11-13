import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

type FirebaseAuthProps = {
  onAuthenticated: () => void;
};

export default function FirebaseAuth({
  onAuthenticated,
}: FirebaseAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Account created successfully!");

        setTimeout(() => {
          onAuthenticated();
        }, 500);
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Welcome back to CampVerse!");

        setTimeout(() => {
          onAuthenticated();
        }, 500);
      }
    } catch (error: any) {
      let friendlyMessage = "Something went wrong.";

      if (error.code === "auth/email-already-in-use") {
        friendlyMessage =
          "This email already has a CampVerse account.";
      } else if (error.code === "auth/invalid-email") {
        friendlyMessage =
          "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        friendlyMessage =
          "Password must be at least 6 characters.";
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        friendlyMessage =
          "Incorrect email or password.";
      }

      setMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "440px",
        padding: "38px",
        borderRadius: "28px",
        background:
          "linear-gradient(145deg,#111111,#050505)",
        border:
          "1px solid rgba(212,175,55,0.4)",
        boxShadow:
          "0 30px 100px rgba(0,0,0,0.75), inset 0 0 40px rgba(212,175,55,0.03)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 18px",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg,#f5d76e,#d4af37)",
            color: "#050505",
            fontSize: "28px",
            fontWeight: 900,
            boxShadow:
              "0 10px 35px rgba(212,175,55,0.25)",
          }}
        >
          C
        </div>

        <h2
          style={{
            color: "#f5d76e",
            fontSize: "34px",
            margin: "0 0 8px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {isSignUp
            ? "Join CampVerse"
            : "Welcome Back"}
        </h2>

        <p
          style={{
            color: "#a99c77",
            margin: 0,
            fontSize: "14px",
          }}
        >
          {isSignUp
            ? "Create your campus identity."
            : "Your campus. Your community. Your space."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label
          style={{
            display: "block",
            color: "#d4af37",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "7px",
          }}
        >
          EMAIL
        </label>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          style={{
            width: "100%",
            padding: "15px 16px",
            marginBottom: "18px",
            borderRadius: "13px",
            border:
              "1px solid rgba(212,175,55,0.25)",
            background: "#080808",
            color: "#fff",
            outline: "none",
            boxSizing: "border-box",
            fontSize: "14px",
          }}
        />

        <label
          style={{
            display: "block",
            color: "#d4af37",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "7px",
          }}
        >
          PASSWORD
        </label>

        <input
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          minLength={6}
          style={{
            width: "100%",
            padding: "15px 16px",
            marginBottom: "20px",
            borderRadius: "13px",
            border:
              "1px solid rgba(212,175,55,0.25)",
            background: "#080808",
            color: "#fff",
            outline: "none",
            boxSizing: "border-box",
            fontSize: "14px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            border: "none",
            borderRadius: "13px",
            background:
              "linear-gradient(135deg,#f5d76e,#d4af37)",
            color: "#050505",
            fontWeight: 800,
            fontSize: "14px",
            cursor: loading
              ? "wait"
              : "pointer",
            boxShadow:
              "0 10px 30px rgba(212,175,55,0.2)",
          }}
        >
          {loading
            ? "Connecting..."
            : isSignUp
              ? "Create CampVerse Account"
              : "Enter CampVerse"}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: "18px",
            padding: "12px 14px",
            borderRadius: "12px",
            background:
              "rgba(212,175,55,0.08)",
            border:
              "1px solid rgba(212,175,55,0.18)",
            color: "#f5d76e",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: "25px",
          paddingTop: "22px",
          borderTop:
            "1px solid rgba(212,175,55,0.12)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: "#777",
            fontSize: "13px",
          }}
        >
          {isSignUp
            ? "Already part of CampVerse?"
            : "New to CampVerse?"}
        </span>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage("");
          }}
          style={{
            marginLeft: "7px",
            background: "transparent",
            border: "none",
            color: "#f5d76e",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          {isSignUp
            ? "Sign in"
            : "Create an account"}
        </button>
      </div>
    </div>
  );
}