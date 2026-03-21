"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DEMO_SCHOOL } from "@veda/shared";

const navItems = [
  { href: "/home", label: "Home", icon: "home", matchPrefix: "/home" },
  { href: "/groups", label: "My Groups", icon: "groups", matchPrefix: "/groups" },
  { href: "/assignments", label: "Assignments", icon: "assignment", matchPrefix: "/assignments" },
  { href: "/toolkit", label: "AI Teacher's Toolkit", icon: "toolkit", matchPrefix: "/toolkit" },
  { href: "/library", label: "My Library", icon: "library", matchPrefix: "/library" }
] as const;

function NavIcon({ type }: { type: string }) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 4.5h5v5H4zm7 0h5v5h-5zM4 11.5h5v5H4zm7 0h5v5h-5z" />
      </svg>
    );
  }

  if (type === "groups") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3.5 5.5h6v4h-6zm7 0h6v9h-6zm-7 5.5h6v3.5h-6z" />
      </svg>
    );
  }

  if (type === "assignment") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5.5 2.5h6l3 3v12h-9a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2zm5 .9v2.4h2.4zM6.8 9h6.4v1.2H6.8zm0 3h6.4v1.2H6.8z" />
      </svg>
    );
  }

  if (type === "toolkit") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 2.5h10a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 15 17.5H5A1.5 1.5 0 0 1 3.5 16V4A1.5 1.5 0 0 1 5 2.5zm2 3.2h6v1.2H7zm0 3h6v1.2H7zm0 3h4v1.2H7z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2.5a7.5 7.5 0 1 0 7.5 7.5H10V2.5zm1.2 1.6v4.7h4.7A6.3 6.3 0 0 0 11.2 4.1zM10 11.2h6.2A6.2 6.2 0 1 1 8.8 3.9v7.3A1 1 0 0 0 10 11.2z" />
    </svg>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
  breadcrumbLabel,
  backHref = "/home"
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  breadcrumbLabel?: string;
  backHref?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeLabel =
    navItems.find((item) => pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`))?.label ||
    "Home";

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backHref);
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span>V</span>
          </div>
          <div>
            <div className="brand-name">VedaAI</div>
          </div>
        </div>

        <Link className="primary-cta" href="/assignments/new">
          <span className="cta-spark">✦</span>
          <span>Create Assignment</span>
        </Link>

        <nav className="nav-list">
          {navItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`nav-item ${item.label === activeLabel ? "is-active" : ""}`}
            >
              <span className="nav-icon">
                <NavIcon type={item.icon} />
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link className={`settings-link ${pathname.startsWith("/settings") ? "is-active" : ""}`} href="/settings">
            <span className="nav-icon">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M8.7 2.8h2.6l.5 1.8a5.9 5.9 0 0 1 1.3.5l1.7-.9 1.8 1.8-.9 1.7c.2.4.4.8.5 1.3l1.8.5v2.6l-1.8.5a5.9 5.9 0 0 1-.5 1.3l.9 1.7-1.8 1.8-1.7-.9c-.4.2-.8.4-1.3.5l-.5 1.8H8.7l-.5-1.8a5.9 5.9 0 0 1-1.3-.5l-1.7.9-1.8-1.8.9-1.7a5.9 5.9 0 0 1-.5-1.3L2 11.3V8.7l1.8-.5c.1-.5.3-.9.5-1.3l-.9-1.7 1.8-1.8 1.7.9c.4-.2.8-.4 1.3-.5zm1.3 4.4a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z" />
              </svg>
            </span>
            <span>Settings</span>
          </Link>
          <div className="school-card">
            <div className="school-avatar">{DEMO_SCHOOL.teacherAvatarLabel}</div>
            <div>
              <div className="school-name">{DEMO_SCHOOL.schoolName}</div>
              <div className="school-address">{DEMO_SCHOOL.schoolAddress}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="page-header">
          <div className="page-header-main">
            <div className="breadcrumb-group">
              <button className="back-chip" type="button" aria-label="Go back" onClick={handleBack}>
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10.7 4.1 4.8 10l5.9 5.9 1-1L7.4 10l4.3-4.9z" />
                </svg>
              </button>
              <span className="crumb-icon">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 4.5h5v5H4zm7 0h5v5h-5zM4 11.5h5v5H4zm7 0h5v5h-5z" />
                </svg>
              </span>
              <div className="breadcrumb-copy">
                <div className="breadcrumb">{breadcrumbLabel || title}</div>
              </div>
            </div>
            <div className="page-titles">
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
          </div>
          <div className="page-header-actions">
            {actions}
            <button className="icon-bell" type="button" aria-label="Notifications">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 2.8a4 4 0 0 0-4 4v2.2c0 .7-.2 1.4-.6 2l-1 1.7v1h11.2v-1l-1-1.7c-.4-.6-.6-1.3-.6-2V6.8a4 4 0 0 0-4-4zm0 14.4a2 2 0 0 0 1.9-1.4H8.1A2 2 0 0 0 10 17.2z" />
              </svg>
              <span className="icon-bell-dot" />
            </button>
            <div className="profile-chip">
              <span className="profile-name">{DEMO_SCHOOL.teacherName}</span>
              <svg className="profile-chevron" viewBox="0 0 20 20" aria-hidden="true">
                <path d="m5.8 7.8 4.2 4.4 4.2-4.4 1 1L10 14.2 4.8 8.8z" />
              </svg>
            </div>
          </div>
        </header>
        <section className="page-body">{children}</section>
      </main>
    </div>
  );
}
