"use client";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import UserContext from "@/contexts/UserContext";
import ExpandableText from "./ExpandableText";

function formatDate(dateString: string) {
  return format(parseISO(dateString), "d MMM yyyy");
}

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

export default function ProjectCard({ project }: { project: any }) {
  const { user } = useContext(UserContext);

  return (
    <Card key={project.id} className="p-2 gap-2">
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
      <CardHeader className="p-2 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{project.name}</CardTitle>
          {user && project.owner.id === user.id && (
            <Link href={`/projects/edit/${project.id}`}>
              <Pencil className="w-5 h-5 text-blue-600" />
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
        <ExpandableText text={project.description}/>
      </CardContent>
    </Card>
  );
}
