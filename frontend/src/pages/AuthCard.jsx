import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorHelper";
import Mascot from "../components/Mascot";
import "./AuthCard.css";

const Hero = ({ type, active, title, text, buttonText, onClick }) => (
  <div className={`hero ${type} ${active ? "active" : ""}`}>
    <h2>{title}</h2>
    <p>{text}</p>
    <button type="button" onClick={onClick}>
      {buttonText}
    </button>
  </div>
);

function AuthCard() {
  const [view, setView] = useState("signup");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const [signupForm, setSignupForm] = useState({ fullName: "", email: "", password: "" });
  const [signinForm, setSigninForm] = useState({ email: "", password: "" });

  const { login } = useAuth();
  const navigate = useNavigate();

  const isSignup = view === "signup";
  const toggleView = () => {
    setError("");
    setView(isSignup ? "signin" : "signup");
  };

  const handleSignupChange = (e) => setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  const handleSigninChange = (e) => setSigninForm({ ...signinForm, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(signupForm.fullName, signupForm.email, signupForm.password);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(signinForm.email, signinForm.password);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed, check your credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page auth-card-page">
      <div className="mascot-wrapper" onClick={() => setShowTip((s) => !s)}>
        <Mascot passwordFocused={passwordFocused} />
        {showTip && (
          <div className="mascot-tip">
            {isSignup
              ? "Fill in your details and I'll get you started!"
              : "Enter your email and password to log in."}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-bg" style={{ translate: isSignup ? 0 : "100%" }} />

        <Hero
          type="signup"
          active={isSignup}
          title="Welcome Back!"
          text="Sign in to keep track of your tasks and stay on top of your day."
          buttonText="SIGN IN"
          onClick={toggleView}
        />

        <div className={`form signup ${isSignup ? "active" : ""}`}>
          <h2>Create Account</h2>
          {error && isSignup && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={handleSignup}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={signupForm.fullName}
              onChange={handleSignupChange}
              onFocus={() => setPasswordFocused(false)}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={signupForm.email}
              onChange={handleSignupChange}
              onFocus={() => setPasswordFocused(false)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={handleSignupChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              minLength={8}
              required
            />
            <button disabled={loading}>{loading ? "..." : "SIGN UP"}</button>
          </form>
        </div>

        <Hero
          type="signin"
          active={!isSignup}
          title="Hey There!"
          text="New here? Create an account and start organizing your tasks today."
          buttonText="SIGN UP"
          onClick={toggleView}
        />

        <div className={`form signin ${!isSignup ? "active" : ""}`}>
          <h2>Sign In</h2>
          {error && !isSignup && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={handleSignin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={signinForm.email}
              onChange={handleSigninChange}
              onFocus={() => setPasswordFocused(false)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signinForm.password}
              onChange={handleSigninChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
            />
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            <button disabled={loading}>{loading ? "..." : "SIGN IN"}</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AuthCard;
