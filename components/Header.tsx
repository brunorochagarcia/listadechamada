import { auth, signOut } from "@/auth";
import { LogOut } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.name}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
