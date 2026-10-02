"use client";

import { useRef } from "react";
import { states } from "@/content/site";
import { lock, scrollToId } from "@/lib/scroll";

// The nav is the page's state machine, drawn: labels are nodes on one edge, a token marks where you are.
// Motion.tsx positions the nodes and moves the token; this file is the markup and the phone menu.
export default function Nav() {
  const menu = useRef<HTMLDialogElement>(null);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (menu.current?.open) menu.current.close();
    scrollToId(id);
    history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
  };

  return (
    <header className="nav" data-theme="dark">
      <a className="skip" href="#experience">
        Skip to content
      </a>
      <nav aria-label="Sections">
        <ul className="nav-links">
          {states.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} data-nav={s.state} onClick={(e) => go(e, s.id)}>
                <small>{s.n}</small>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-m">
          <a href="#top" onClick={(e) => go(e, "top")}>
            <small>00</small>Ayush Gade
          </a>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              menu.current?.showModal();
              lock(true);
            }}
          >
            Menu
          </button>
        </div>
      </nav>
      <div className="edge" aria-hidden="true">
        <span className="lit" />
        {states.map((s) => (
          <span key={s.id} className="node" data-node={s.state} />
        ))}
        <span className="token" />
      </div>

      <dialog ref={menu} className="menu" aria-label="Sections" onClose={() => lock(false)}>
        <button type="button" className="close" onClick={() => menu.current?.close()}>
          Close
        </button>
        {states.map((s) => (
          <a key={s.id} href={`#${s.id}`} onClick={(e) => go(e, s.id)}>
            <small>{s.n}</small>
            {s.label}
          </a>
        ))}
      </dialog>
    </header>
  );
}
