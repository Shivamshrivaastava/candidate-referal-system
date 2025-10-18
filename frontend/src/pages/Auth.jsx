import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { UserPlus, LogIn } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Auth({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? `${API}/auth/login` : `${API}/auth/signup`;
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(
        isLogin ? "Login successful!" : "Account created successfully!"
      );
      setIsAuthenticated(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" data-testid="auth-page">
      <div className="auth-content">
        <div className="auth-header">
          <h1 className="auth-title" data-testid="auth-title">
            ReferHub
          </h1>
          <p className="auth-subtitle">
            Candidate Referral Management System
          </p>
        </div>

        <div className="auth-card" data-testid="auth-card">
          <div className="auth-card-header">
            <h2 data-testid="card-title">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p data-testid="card-description">
              {isLogin
                ? "Sign in to manage referrals"
                : "Sign up to start referring candidates"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  id="full_name"
                  data-testid="full-name-input"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                data-testid="password-input"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              data-testid="auth-submit-button"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                "Processing..."
              ) : isLogin ? (
                <>
                  <LogIn className="button-icon" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="button-icon" /> Sign Up
                </>
              )}
            </button>
          </form>

          <div className="toggle-auth">
            <p>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                type="button"
                data-testid="toggle-auth-button"
                onClick={() => setIsLogin(!isLogin)}
                className="toggle-button"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #fef3c7 100%);
        }

        .auth-content {
          width: 100%;
          max-width: 450px;
          padding: 1rem;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: #64748b;
          font-size: 1rem;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .auth-card-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

        .auth-card-header p {
          color: #64748b;
          margin-top: 0.3rem;
          margin-bottom: 1.5rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-weight: 600;
          font-size: 0.95rem;
          color: #0f172a;
        }

        .form-group input {
          padding: 0.6rem 0.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          border-color: #0284c7;
          outline: none;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
        }

        .submit-button {
          margin-top: 0.5rem;
          height: 44px;
          font-weight: 600;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.3);
        }

        .button-icon {
          width: 18px;
          height: 18px;
        }

        .toggle-auth {
          margin-top: 1.5rem;
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
        }

        .toggle-button {
          background: none;
          border: none;
          color: #0284c7;
          font-weight: 600;
          cursor: pointer;
          margin-left: 0.5rem;
          transition: color 0.2s;
        }

        .toggle-button:hover {
          color: #0369a1;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .auth-title {
            font-size: 2.2rem;
          }
          .auth-card {
            padding: 1.5rem;
          }
          .submit-button {
            height: 42px;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .auth-title {
            font-size: 1.8rem;
          }
          .auth-card {
            padding: 1.2rem;
          }
          .submit-button {
            height: 40px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
