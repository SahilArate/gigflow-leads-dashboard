"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError("");
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
          <div style={{
            width: "36px", height: "36px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={20} color="#000000" />
          </div>
          <span style={{ fontSize: "20px", fontWeight: "600", color: "#ffffff" }}>GigFlow</span>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: "#0a0a0a",
          border: "1px solid #222222",
          borderRadius: "16px",
          padding: "40px",
        }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#ffffff", marginBottom: "6px" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: "14px", color: "#666666" }}>
              Sign in to your GigFlow account
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: "20px",
              padding: "12px 16px",
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px",
            }}>
              <p style={{ fontSize: "13px", color: "#f87171" }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#aaaaaa", marginBottom: "8px" }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  backgroundColor: "#111111",
                  border: `1px solid ${errors.email ? "#ef4444" : "#333333"}`,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                {...register("email")}
              />
              {errors.email && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#aaaaaa", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    backgroundColor: "#111111",
                    border: `1px solid ${errors.password ? "#ef4444" : "#333333"}`,
                    borderRadius: "8px",
                    padding: "10px 42px 10px 14px",
                    fontSize: "14px",
                    color: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#666666", display: "flex", alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxSizing: "border-box",
              }}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ marginTop: "28px", textAlign: "center", fontSize: "13px", color: "#555555" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#ffffff", textDecoration: "underline" }}>
              Create one
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#333333", marginTop: "24px" }}>
          GigFlow — Smart Leads Dashboard
        </p>
      </div>
    </div>
  );
}