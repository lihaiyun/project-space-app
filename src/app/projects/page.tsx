"use client";
import http from "@/utils/http";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/contexts/UserContext";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";

export default function Projects() {
  const { user } = useContext(UserContext);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  function handleAddProjectClick(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      router.push("/auth/login");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mx-2">Projects</h1>
        <Button asChild>
          <Link href="/projects/add" onClick={handleAddProjectClick}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Link>
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner className="w-8 h-8 text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
