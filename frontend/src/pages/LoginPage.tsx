import React, { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const password = (formData.get("password") as string | null) ?? "";

    dispatch(login({ email, password }))
      .unwrap()
      .then(() => {
        navigate("/");
      })
      .catch(() => {
        // error is stored in auth.error; nothing else to do here
      });
  }

  return (
    <div className="auth-container">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" required />
        </label>
        {auth.error && <p className="error-text">{auth.error}</p>}
        <button type="submit" disabled={auth.status === "loading"}>
          {auth.status === "loading" ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
