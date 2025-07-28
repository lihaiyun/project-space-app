"use client";
import http from "@/utils/http";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/contexts/UserContext";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";

export default function Projects() {
  const { isAuthenticated } = useContext(UserContext);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      console.log("Fetching projects with search term:", searchTerm);
      setLoading(true);
      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await http.get("/projects", { params });
        setProjects(response.data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [searchTerm]);

  function handleAddProjectClick(e: React.MouseEvent) {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/auth/login");
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchTerm(searchQuery);
  }

  function handleClearSearch() {
    setSearchQuery("");
    setSearchTerm("");
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
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mx-1 mb-3 max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" variant="ghost">
            <Search className="w-5 h-5 text-blue-600" />
          </Button>
          {(searchQuery || searchTerm) && (
            <Button type="button" variant="outline" onClick={handleClearSearch}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>

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
