import { useContext } from "react";
import UserContext from "@/contexts/UserContext";
import http from "@/utils/http";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function MainMenu() {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await http.post("/users/logout");
    } catch (e) {
      // Optionally handle error
      console.error("Logout failed:", e);
    }
    setUser(null);
    router.push("/user/login");
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
            {user ? (
              <>
                <span className="text-lg font-bold px-2 pt-1">{user.name}</span>
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
                    <Link href="/user/login">Login</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className="text-lg" asChild>
                    <Link href="/user/register">Register</Link>
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