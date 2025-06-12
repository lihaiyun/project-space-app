"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import http from "@/utils/http";
import { useContext } from "react";
import UserContext from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Email must be a valid email address"),
  password: Yup.string()
    .trim()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const { setUser } = useContext(UserContext);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: (data) => {
      data.email = data.email.trim().toLowerCase();
      data.password = data.password.trim();
      http
        .post("/users/login", data)
        .then((res) => {
          // Handle successful login
          setUser(res.data.user);
          toast.success("Login successful!");
          router.push("/"); // Redirect to home page after login
        })
        .catch(function (err) {
          // Handle error, e.g., show a notification or alert
          toast.error(
            err.response?.data?.message || "Login failed. Please try again."
          );
        });
    },
  });

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="w-full max-w-md" onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            {...formik.getFieldProps("email")}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formik.touched.email && formik.errors.email
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.email}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            {...formik.getFieldProps("password")}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formik.touched.password && formik.errors.password
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.password}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}
