"use client";

import React from "react";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
  Spacer,
  Tooltip,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "usehooks-ts";

import Sidebar from "./sidebar/sidebar";
import { dashboardSidebarItems } from "./sidebar/sidebar-items";
import { AcmeIcon } from "../icons/acme-icon";
import NotificationsCard from "./notifications-card";
import { useDashboardTheme, type ThemeMode } from "@/contexts/dashboard-theme-context";
import { useDashboardTab, type DashboardTab } from "@/contexts/dashboard-tab-context";
import { useAuth } from "@/contexts/auth-context";

function ThemeSelector() {
  const { theme, setTheme } = useDashboardTheme();

  const themes: { key: ThemeMode; icon: string; label: string }[] = [
    { key: "system", icon: "solar:monitor-linear", label: "System" },
    { key: "light", icon: "solar:sun-linear", label: "Light" },
    { key: "dark", icon: "solar:moon-linear", label: "Dark" },
  ];

  return (
    <div className="flex items-center gap-0.5">
      {themes.map((themeOption) => (
        <button
          key={themeOption.key}
          onClick={(e) => {
            e.stopPropagation();
            setTheme(themeOption.key);
          }}
          className={cn(
            "p-1.5 rounded-md transition-all duration-200",
            "hover:bg-default-200",
            theme === themeOption.key
              ? "bg-default-200 text-foreground"
              : "text-default-400"
          )}
          title={themeOption.label}
        >
          <Icon icon={themeOption.icon} width={16} />
        </button>
      ))}
    </div>
  );
}

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const { user, logout } = useAuth();
  const { activeTab, setActiveTab } = useDashboardTab();

  const isCompact = isCollapsed || (isMobile && !isMobileOpen);

  const onToggle = React.useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const handleSelect = React.useCallback(
    (key: string) => {
      // Only set tab for actual page keys, not section headers
      if (key !== "main" && key !== "settings-section" && key !== "data-sources") {
        setActiveTab(key as DashboardTab);
      }
      // Close mobile sidebar on selection
      if (isMobile) {
        setIsMobileOpen(false);
      }
    },
    [setActiveTab, isMobile],
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-full w-full gap-3 bg-default-100 p-3 dark:bg-default-50/50">
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "relative flex h-full flex-col rounded-large bg-background shadow-small transition-all duration-200",
          {
            "w-60 px-3 py-4": !isCompact,
            "w-16 items-center px-2 py-4": isCompact,
          },
          // Mobile: overlay mode
          isMobile && isMobileOpen && "fixed z-50 w-60 px-3 py-4 shadow-xl",
          isMobile && !isMobileOpen && "w-0 overflow-hidden p-0 shadow-none",
        )}
      >
        {/* Logo */}
        <div
          className={cn("flex items-center gap-3 px-3", {
            "justify-center gap-0": isCompact,
          })}
        >
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-foreground">
            <AcmeIcon className="text-background" size={16} />
          </div>
          <span
            className={cn("text-tiny font-bold uppercase opacity-100", {
              "w-0 opacity-0": isCompact,
            })}
          >
            Acme
          </span>
        </div>

        <Spacer y={4} />

        {/* Navigation */}
        <ScrollShadow className={cn("-mr-6 h-full max-h-full py-2 pr-6", { "mr-0 pr-0": isCompact })}>
          <Sidebar
            defaultSelectedKey={activeTab}
            isCompact={isCompact}
            items={dashboardSidebarItems}
            onSelect={handleSelect}
          />
        </ScrollShadow>

        <Spacer y={2} />

        {/* Bottom Actions */}
        <div
          className={cn("mt-auto flex flex-col", {
            "items-center": isCompact,
          })}
        >
          {/* Notifications */}
          <Popover offset={12} placement="right-end">
            <PopoverTrigger>
              <Button
                fullWidth={!isCompact}
                className={cn(
                  "text-default-500 data-[hover=true]:text-foreground justify-start truncate",
                  { "justify-center": isCompact },
                )}
                isIconOnly={isCompact}
                startContent={
                  isCompact ? null : (
                    <Badge color="danger" content="5" showOutline={false} size="sm">
                      <Icon className="text-default-500 flex-none" icon="solar:bell-linear" width={22} />
                    </Badge>
                  )
                }
                variant="light"
              >
                {isCompact ? (
                  <Badge color="danger" content="5" showOutline={false} size="sm">
                    <Icon className="text-default-500" icon="solar:bell-linear" width={22} />
                  </Badge>
                ) : (
                  <span className="ml-1">Notifications</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
              <NotificationsCard className="w-full shadow-none" />
            </PopoverContent>
          </Popover>

          {/* Help */}
          <Tooltip content="Help & Information" isDisabled={!isCompact} placement="right">
            <Button
              fullWidth={!isCompact}
              className={cn(
                "text-default-500 data-[hover=true]:text-foreground justify-start truncate",
                { "justify-center": isCompact },
              )}
              isIconOnly={isCompact}
              startContent={
                isCompact ? null : (
                  <Icon
                    className="text-default-500 flex-none"
                    icon="solar:info-circle-line-duotone"
                    width={22}
                  />
                )
              }
              variant="light"
            >
              {isCompact ? (
                <Icon className="text-default-500" icon="solar:info-circle-line-duotone" width={22} />
              ) : (
                "Help & Information"
              )}
            </Button>
          </Tooltip>

          {/* Logout */}
          <Tooltip content="Log Out" isDisabled={!isCompact} placement="right">
            <Button
              fullWidth={!isCompact}
              className={cn(
                "text-default-500 data-[hover=true]:text-foreground justify-start",
                { "justify-center": isCompact },
              )}
              isIconOnly={isCompact}
              startContent={
                isCompact ? null : (
                  <Icon
                    className="text-default-500 flex-none rotate-180"
                    icon="solar:minus-circle-line-duotone"
                    width={22}
                  />
                )
              }
              variant="light"
              onPress={handleLogout}
            >
              {isCompact ? (
                <Icon className="text-default-500 rotate-180" icon="solar:minus-circle-line-duotone" width={22} />
              ) : (
                "Log Out"
              )}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex w-full flex-1 flex-col gap-3 overflow-hidden">
        {/* Top bar with toggle and avatar */}
        <header className="flex h-14 flex-none items-center gap-3 rounded-large bg-background px-4 shadow-small">
          <Button isIconOnly size="sm" variant="light" onPress={onToggle}>
            <Icon
              className="text-default-500"
              height={22}
              icon="solar:sidebar-minimalistic-outline"
              width={22}
            />
          </Button>
          <h2 className="text-small font-medium text-default-700 capitalize">
            {(activeTab ?? "").replace(/-/g, " ").replace("sources ", "")}
          </h2>

          {/* Right side: avatar dropdown */}
          <div className="ml-auto flex items-center gap-3">
            <Input
              aria-label="Search"
              classNames={{
                inputWrapper: "bg-content2 dark:bg-content1 h-8",
                input: "text-tiny",
              }}
              labelPlacement="outside"
              placeholder="Search..."
              radius="sm"
              size="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:magnifer-linear" width={16} />
              }
              className="w-48"
            />
            <Popover offset={12} placement="bottom-end">
              <PopoverTrigger>
                <button className="relative flex items-center justify-center cursor-pointer text-default-500 hover:text-foreground transition-colors p-1">
                  <Badge color="danger" content="5" showOutline={false} size="sm">
                    <Icon icon="solar:bell-linear" width={22} />
                  </Badge>
                </button>
              </PopoverTrigger>
              <PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
                <NotificationsCard className="w-full shadow-none" />
              </PopoverContent>
            </Popover>
            <Dropdown placement="bottom-end" classNames={{ content: "min-w-[260px]" }}>
              <DropdownTrigger>
                <button className="flex items-center outline-none transition-transform hover:scale-105">
                  <Badge color="success" content="" placement="bottom-right" shape="circle">
                    <Avatar size="sm" src="https://i.pravatar.cc/150?u=a04258114e29526708c" />
                  </Badge>
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Profile Actions"
                variant="flat"
                classNames={{ base: "p-0" }}
              >
                {/* User Info Header */}
                <DropdownSection showDivider classNames={{ base: "pb-0" }}>
                  <DropdownItem
                    key="profile"
                    isReadOnly
                    className="h-auto gap-2 py-3 cursor-default data-[hover=true]:bg-transparent"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-foreground">
                        {user?.tenantName || "User"}
                      </p>
                      <p className="text-small text-default-500">
                        {user?.email || ""}
                      </p>
                    </div>
                  </DropdownItem>
                </DropdownSection>

                {/* Navigation Section */}
                <DropdownSection showDivider>
                  <DropdownItem
                    key="dashboard"
                    startContent={<Icon icon="solar:home-2-linear" width={18} className="text-default-500" />}
                  >
                    Dashboard
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    startContent={<Icon icon="solar:settings-linear" width={18} className="text-default-500" />}
                  >
                    Account Settings
                  </DropdownItem>
                </DropdownSection>

                {/* Team Section */}
                <DropdownSection showDivider>
                  <DropdownItem
                    key="create_team"
                    startContent={<Icon icon="solar:users-group-rounded-linear" width={18} className="text-default-500" />}
                    endContent={<Icon icon="solar:add-circle-linear" width={18} className="text-default-400" />}
                  >
                    Create Team
                  </DropdownItem>
                </DropdownSection>

                {/* Preferences Section */}
                <DropdownSection showDivider>
                  <DropdownItem
                    key="command_menu"
                    startContent={<Icon icon="solar:command-linear" width={18} className="text-default-500" />}
                    endContent={
                      <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 text-tiny font-medium bg-default-100 rounded">⌘</kbd>
                        <kbd className="px-1.5 py-0.5 text-tiny font-medium bg-default-100 rounded">K</kbd>
                      </div>
                    }
                  >
                    Command Menu
                  </DropdownItem>
                  <DropdownItem
                    key="theme"
                    isReadOnly
                    className="cursor-default"
                    startContent={<Icon icon="solar:palette-linear" width={18} className="text-default-500" />}
                    endContent={<ThemeSelector />}
                  >
                    Theme
                  </DropdownItem>
                </DropdownSection>

                {/* Footer Section */}
                <DropdownSection>
                  <DropdownItem
                    key="help_dropdown"
                    startContent={<Icon icon="solar:question-circle-linear" width={18} className="text-default-500" />}
                  >
                    Help & Feedback
                  </DropdownItem>
                  <DropdownItem
                    key="logout_dropdown"
                    startContent={<Icon icon="solar:logout-2-linear" width={18} className="text-danger" />}
                    className="text-danger"
                    color="danger"
                    onPress={handleLogout}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-hidden rounded-large bg-background shadow-small">{children}</main>
      </div>
    </div>
  );
}
