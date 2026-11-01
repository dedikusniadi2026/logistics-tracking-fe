import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export type SidebarMenuItem = {
  path?: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
};

export default function SidebarMenu({
  items,
  onItemClick,
}: {
  items: SidebarMenuItem[];
  onItemClick?: () => void;
}) {
  return (
    <nav className="px-4 space-y-1">
      {items.map((item) => {
        const content = (
          <div
            className={
              "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 " +
              (item.disabled ? "opacity-50 cursor-not-allowed" : "")
            }
            onClick={() => {
              if (item.disabled) return;
              onItemClick?.();
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        );

        if (item.disabled || !item.path) return <div key={item.label}>{content}</div>;

        return (
          <NavLink key={item.label} to={item.path} end className="block">
            {({ isActive }) => (
              <div
                className={
                  "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 " +
                  (isActive ? "bg-gray-100" : "")
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

