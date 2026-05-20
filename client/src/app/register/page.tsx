"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase and number"),
  role: z.enum(["admin", "sales"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "sales" },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError("");
      await registerUser(data.name, data.email, data.password, data.role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create account");
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: "100%",
    backgroundColor: "#111111",
    border: `1px solid ${hasError ? "#ef4444" : "#333333"}`,
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box" as const,
  });

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500" as const,
    color: "#aaaaaa",
    marginBottom: "8px",
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
              Create account
            </h1>
            <p style={{ fontSize: "14px", color: "#666666" }}>
              Start managing your leads pipeline
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
            {/* Name */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" placeholder="John Doe" style={inputStyle(!!errors.name)} {...register("name")} />
              {errors.name && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email address</label>
              <input type="email" placeholder="you@example.com" style={inputStyle(!!errors.email)} {...register("email")} />
              {errors.email && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, upper, lower, number"
                  style={{ ...inputStyle(!!errors.password), paddingRight: "42px" }}
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

            {/* Role */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Role</label>
              <select
                style={{
                  ...inputStyle(!!errors.role),
                  cursor: "pointer",
                }}
                {...register("role")}
              >
                <option value="sales">Sales User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>{errors.role.message}</p>}
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
              {isSubmitting ? "Creating account..." : "Create account"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ marginTop: "28px", textAlign: "center", fontSize: "13px", color: "#555555" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#ffffff", textDecoration: "underline" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}