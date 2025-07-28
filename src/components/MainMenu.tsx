import { useContext } from "react";
import UserContext from "@/contexts/UserContext";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function MainMenu() {
  const { isAuthenticated, user, logout } = useContext(UserContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <nav className="flex container mx-auto my-4">
      <NavigationMenu>
        <NavigationMenuList>
          <div className="flex gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`text-lg ${
                  pathname === "/" ? "font-bold text-blue-600" : ""
                }`}
                asChild
              >
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`text-lg ${
                  pathname.startsWith("/projects")
                    ? "font-bold text-blue-600"
                    : ""
                }`}
                asChild
              >
                <Link href="/projects">Projects</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
      <NavigationMenu className="ml-auto">
        <NavigationMenuList className="flex">
          <div className="flex gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-lg font-bold px-2 pt-1">{user?.name}</span>
                <NavigationMenuItem>
                  <button
                    className="text-lg px-2 py-1 rounded hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </NavigationMenuItem>
              </>
            ) : (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink className="text-lg" asChild>
                    <Link href="/auth/login">Login</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className="text-lg" asChild>
                    <Link href="/auth/register">Register</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}