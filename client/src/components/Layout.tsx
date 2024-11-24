import { ReactNode } from "react";
import Header from "./Header";
import AppSidebar from "./app-sidebar";

const Layout = ({ children }: { children: ReactNode }) => (
  <section className="w-screen h-screen flex scroll-smooth">
    <AppSidebar />
    <div className="size-full flex flex-col">
      <Header />
      <main className="flex flex-col w-full min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  </section>
);

export default Layout;
