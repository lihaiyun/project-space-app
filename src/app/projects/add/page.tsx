"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import http from "@/utils/http";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format, parse } from "date-fns";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronsUpDown } from "lucide-react";

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

const statusOptions = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

// Helper to parse YYYY-MM-DD as local date
function parseLocalDate(dateString: string) {
  return parse(dateString, "yyyy-MM-dd", new Date());
}

export default function AddProject() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        await http.post("/projects", values);
        router.push("/projects");
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to add project");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
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

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        uploadImage(file);
      } else {
        setError("Please upload an image file");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Project</h1>
      <form className="w-full max-w-4xl" onSubmit={formik.handleSubmit}>
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
            {/* Date Picker with Popover */}
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
                      ? format(
                          parseLocalDate(formik.values.dueDate),
                          "d MMM yyyy"
                        )
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
            {/* Combobox with Popover */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="status"
              >
                Status
              </label>
              <Popover
                open={statusPopoverOpen}
                onOpenChange={setStatusPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={statusPopoverOpen}
                    className={cn(
                      "w-full justify-between",
                      !formik.values.status && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    {statusOptions.find(
                      (opt) => opt.value === formik.values.status
                    )?.label || "Select status"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandList>
                      {statusOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            formik.setFieldValue("status", option.value);
                            setStatusPopoverOpen(false);
                          }}
                        >
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
              <button
                type="button"
                className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
                onClick={() => document.getElementById('image')?.click()}
              >
                Choose File
              </button>
              <div
                className={`border-2 border-dashed rounded-lg mt-2 p-6 text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="space-y-2">
                  <div className="text-gray-500">
                    {isDragOver ? (
                      <p className="text-blue-600">Drop image here</p>
                    ) : (
                      <p>Drag and drop an image here</p>
                    )}
                  </div>
                </div>
              </div>
              
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
            {formik.isSubmitting ? "Adding..." : "Add Project"}
          </button>
          <button
            type="button"
            className="w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition-colors bg-white"
            onClick={() => router.push("/projects")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
