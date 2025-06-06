"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import http from "@/utils/http";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format, parse, parseISO } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const projectSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  description: Yup.string().max(
    500,
    "Description must be at most 500 characters"
  ),
  dueDate: Yup.date().required("Due date is required"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["not-started", "in-progress", "completed"], "Invalid status"),
});

// Helper to parse YYYY-MM-DD as local date
function parseLocalDate(dateString: string) {
  return parse(dateString, "yyyy-MM-dd", new Date());
}

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      dueDate: "",
      status: "not-started",
      imageId: "",
      imageUrl: "",
    },
    validationSchema: projectSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        await http.put(`/projects/${params.id}`, values);
        router.push("/projects");
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to update project");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await http.get(`/projects/${params.id}`);
        const { name, description, dueDate, status } = res.data;
        // Use date-fns to convert to YYYY-MM-DD for input type="date"
        let localDueDate = format(parseISO(dueDate), "yyyy-MM-dd");
        formik.setValues({
          name: name || "",
          description: description || "",
          dueDate: localDueDate,
          status: status || "not-started",
          imageId: res.data.imageId || "",
          imageUrl: res.data.imageUrl || "",
        });
      } catch (err: any) {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setUploadProgress(true);
    try {
      const res = await http.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      formik.setFieldValue("imageUrl", res.data.imageUrl);
      formik.setFieldValue("imageId", res.data.imageId);
      setUploadProgress(false);
    } catch (err) {
      setError("Image upload failed");
      setUploadProgress(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await http.delete(`/projects/${params.id}`);
      router.push("/projects");
    } catch (err: any) {
      setError("Failed to delete project");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner className="w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Edit Project</h1>
      <form className="w-full max-w-2xl" onSubmit={formik.handleSubmit}>
        {/* Row: Form fields (left) and image (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form fields */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="name">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.name}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.description && formik.errors.description
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              ></textarea>
              {formik.touched.description && formik.errors.description && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.description}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="dueDate"
              >
                Due Date
              </label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formik.values.dueDate && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formik.values.dueDate
                      ? format(parseLocalDate(formik.values.dueDate), "d MMM yyyy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      formik.values.dueDate
                        ? parseLocalDate(formik.values.dueDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      formik.setFieldValue(
                        "dueDate",
                        date ? format(date, "yyyy-MM-dd") : ""
                      );
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formik.touched.dueDate && formik.errors.dueDate && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.dueDate}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="status"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.status && formik.errors.status
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {formik.touched.status && formik.errors.status && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.status}
                </div>
              )}
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          </div>
          {/* Right: Image upload and preview */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="image">
                Project Image
              </label>
              <label
                htmlFor="image"
                className="inline-block bg-black text-white px-3 py-1 rounded cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Choose File
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {uploadProgress && (
                <div className="flex items-center justify-center mt-2">
                  <Spinner className="text-blue-500" />
                </div>
              )}
              {formik.values.imageUrl && (
                <div className="relative w-full aspect-[16/9] mt-2">
                  <Image
                    src={formik.values.imageUrl}
                    alt="Project Image"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="rounded object-cover"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Buttons below the row */}
        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="w-full border border-red-300 text-red-600 py-2 rounded bg-white hover:bg-red-50 transition-colors"
            onClick={() => setShowConfirm(true)}
            disabled={deleting}
          >
            Delete
          </button>
        </div>
        {/* Confirmation dialog */}
        {showConfirm && (
          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
              </DialogHeader>
              <div className="mb-6">
                Are you sure you want to delete this project? This action cannot be
                undone.
              </div>
              <DialogFooter>
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDelete}
                  disabled={deleting}
                  type="button"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </form>
    </div>
  );
}
