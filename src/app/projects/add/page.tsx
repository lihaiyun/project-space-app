"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import http from "@/utils/http";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format, parse } from "date-fns";

// shadcn/ui components
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronsUpDown } from "lucide-react";

const projectSchema = Yup.object().shape({
    name: Yup.string().trim()
        .required('Name is required')  
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters'),
    description: Yup.string()
        .max(500, 'Description must be at most 500 characters'),
    dueDate: Yup.date()
        .required('Due date is required'),
    status: Yup.string()
        .required('Status is required')
        .oneOf(['not-started', 'in-progress', 'completed'], 'Invalid status')
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

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      dueDate: "",
      status: "not-started",
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

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Project</h1>
      <form className="w-full max-w-md" onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="name">Project Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formik.touched.name && formik.errors.name ? "border-red-500" : "border-gray-300"
            }`}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formik.touched.description && formik.errors.description ? "border-red-500" : "border-gray-300"
            }`}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          ></textarea>
          {formik.touched.description && formik.errors.description && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
          )}
        </div>
        {/* Date Picker with Popover */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="dueDate">Due Date</label>
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
                selected={formik.values.dueDate ? parseLocalDate(formik.values.dueDate) : undefined}
                onSelect={(date) => {
                  formik.setFieldValue("dueDate", date ? format(date, "yyyy-MM-dd") : "");
                  setDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {formik.touched.dueDate && formik.errors.dueDate && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.dueDate}</div>
          )}
        </div>
        {/* Combobox with Popover */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="status">Status</label>
          <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
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
                {statusOptions.find((opt) => opt.value === formik.values.status)?.label || "Select status"}
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
            <div className="text-red-500 text-xs mt-1">{formik.errors.status}</div>
          )}
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Adding..." : "Add Project"}
        </button>
      </form>
    </div>
  );
}
