import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./authLogin.css";

import jioji from "../../assets/Jioji_logo.png";
import { FaUserAlt } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { BASE_URL } from "/src/config/api.js";


function parseJwt(token) {
  try {
    const base64Url = token?.split(".")?.[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/* ================= ROLE HANDLING ================= */
function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");
}

function getDashboardPathByRole(role) {
  const r = normalizeRole(role);
  if (r === "ADMIN") return "/admin/dashboard";
  if (r === "USER") return "/dashboard";
  if (r === "EMPLOYEE" || r === "SURVEYOR") return "/employee/dashboard";
  if (r === "LAB" || r === "LAB_TECHNICIAN") return "/lab/dashboard";
  return "/";
}

/* ================= COMPONENT ================= */
export default function AuthLogin() {
  const navigate = useNavigate();
  const userIdRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setTimeout(() => userIdRef.current?.focus?.(), 0);
  }, []);

  /* ================= LOGIN ================= */
  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!userId.trim() || !password.trim()) {
      setApiError("Username and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userId.trim(),
          password,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg =
          typeof payload === "string"
            ? payload
            : payload?.message || payload?.error || "Invalid credentials";
        throw new Error(msg);
      }

      const token =
        payload?.token ||
        payload?.accessToken ||
        payload?.data?.token ||
        payload?.data?.accessToken;

      if (!token)
        throw new Error("Login successful but token not found");

      const decoded = parseJwt(token);
      const authority = decoded?.authorities?.[0];
      const role = normalizeRole(authority);

      /* ================= SAVE AUTH DATA ================= */
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      localStorage.setItem(
        "employeeCode",
        decoded?.employeeCode || userId.trim()
      );
      localStorage.setItem(
        "employeeName",
        decoded?.employeeName || userId.trim()
      );
      localStorage.setItem("userEmail", userId.trim());

      if (decoded?.userId) {
        localStorage.setItem("userId", decoded.userId);
      }

      /* ================= CRITICAL FIX =================
         Force full reload so auth guards re-evaluate
      */
      window.location.href = getDashboardPathByRole(role);
    } catch (err) {
      setApiError(err?.message || "Login failed");
      userIdRef.current?.focus?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authBg">
      <div className="authCard">
        <div className="authBrand">
          <img className="authLogo" src={jioji} alt="Jioji Green India" />
        </div>

        <h1 className="authHeading">Login</h1>

        {apiError && <div className="authError">{apiError}</div>}

        <form className="authForm" onSubmit={onSubmit}>
          <label className="authLabel">
            Username
            <div className="authField">
              <input
                ref={userIdRef}
                className="authInput"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter Username"
                autoComplete="username"
              />
              <span className="authIcon">
                <FaUserAlt />
              </span>
            </div>
          </label>

          <label className="authLabel">
            Password
            <div className="authField">
              <input
                className="authInput"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="authIconBtn"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
          </label>

          <div className="authRow">
            <label className="authRemember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <button
              type="button"
              className="authLinkBtn"
              onClick={() => navigate("/forgot-password")}
            >
              Forget Password?
            </button>
          </div>

          <button className="authBtn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="authTiny">
            By clicking login you agree to the T&amp;C and Privacy Policy
          </div>
        </form>
      </div>
    </div>
  );
}
