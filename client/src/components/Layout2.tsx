import { ReactNode } from "react";

const Layout2 = ({children}: {children: ReactNode}) => {
  return (
    <section className="w-screen h-screen flex items-center justify-center">
      {children}
    </section>
  );
}

export default Layout2;