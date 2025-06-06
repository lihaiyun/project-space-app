"use client";
import Image from "next/image";
import http from "@/utils/http";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, CheckCircle, XCircle, Clock, Calendar, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/contexts/UserContext";

// Use date-fns for formatting
function formatDate(dateString: string) {
  return format(parseISO(dateString), "d MMM yyyy");
}

export default function Projects() {
  const { user } = useContext(UserContext);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await http.get("/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  function renderStatus(status: string) {
    switch (status) {
      case "completed":
        return (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Completed</span>
          </>
        );
      case "in-progress":
        return (
          <>
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-600">In Progress</span>
          </>
        );
      case "not-started":
      default:
        return (
          <>
            <XCircle className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Not Started</span>
          </>
        );
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mx-2">Projects</h1>
        <Button asChild>
          <Link href="/projects/add">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Link>
        </Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {projects.map((project: any) => (
            <Card key={project._id} className="p-2 gap-2">
              <CardHeader className="p-2 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  {user && project.owner._id === user._id && (
                    <Link href={`/projects/edit/${project._id}`}>
                      <Pencil className="w-5 h-5 text-gray-500 hover:text-blue-600" />
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    {project.owner.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(project.dueDate)}
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    {renderStatus(project.status)}
                  </span>
                </div>
                <p
                  className="text-gray-700 mb-2 whitespace-pre-line line-clamp-2"
                >
                  {project.description}
                </p>
                {project.imageUrl && (
                  <div className="relative w-full aspect-[16/9]">
                    <Image
                      src={project.imageUrl}
                      alt={project.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="rounded object-cover"
                      priority
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
