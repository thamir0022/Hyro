import { ReactNode } from "react";
import Header from "./Header";
import AppSidebar from "./app-sidebar";

const Layout = ({ children }: { children: ReactNode }) => (
  <section className="w-screen h-screen flex">
    <AppSidebar />
    <div className="w-full flex flex-col">
      <Header />
      <main className="flex flex-col w-full min-h-screen">{children}</main>
    </div>
  </section>
);

export default Layout;
