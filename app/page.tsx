import Cursor from "@/components/Cursor";
import Gomu from "@/components/Gomu";
import Motion from "@/components/Motion";
import Nav from "@/components/Nav";
import { About, Chain, Contact, Experience, Hero, Statement, Upstream, Work } from "@/components/Sections";
import Trace from "@/components/Trace";

// One page, six states: INIT · EXPERIENCE · WORK · OPEN SOURCE · ABOUT · CONTACT.
export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Chain />
        <Experience />
        <Work />
        <Upstream />
        <About />
        <Contact />
      </main>
      <Trace />
      <Motion />
      <Gomu />
      <Cursor />
    </>
  );
}
