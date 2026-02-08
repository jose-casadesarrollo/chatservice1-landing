"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  Tab,
  Avatar,
  Chip,
  ScrollShadow,
  Input,
  Badge,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import NotificationsCard from "./notifications-card";
import { AcmeIcon } from "../icons/acme-icon";
import { useDashboardTheme, type ThemeMode } from "@/contexts/dashboard-theme-context";
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

export default function DashboardNavbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-full">
      {/* Top Header Bar - Full Width */}
      <Navbar
        classNames={{
          base: "pt-1.5",
          wrapper: "px-4 sm:px-6 max-w-full",
          item: "data-[active=true]:text-primary",
        }}
        height="60px"
        maxWidth="full"
      >
        <NavbarBrand>
          <NavbarMenuToggle className="mr-2 h-6 sm:hidden" />
          <AcmeIcon />
          <p className="font-bold text-inherit">ACME</p>
        </NavbarBrand>
        {/* Right Menu */}
        <NavbarContent className="ml-auto h-12 max-w-fit items-center gap-0" justify="end">
          {/* Search */}
          <NavbarItem className="mr-2 hidden sm:flex">
            <Input
              aria-label="Search"
              classNames={{
                inputWrapper: "bg-content2 dark:bg-content1",
              }}
              labelPlacement="outside"
              placeholder="Search..."
              radius="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:magnifer-linear" width={20} />
              }
            />
          </NavbarItem>
          {/* Notifications */}
          <NavbarItem className="flex">
            <Popover offset={12} placement="bottom-end">
              <PopoverTrigger>
                <Button
                  disableRipple
                  isIconOnly
                  className="overflow-visible"
                  radius="full"
                  variant="light"
                >
                  <Badge color="danger" content="5" showOutline={false} size="md">
                    <Icon className="text-default-500" icon="solar:bell-linear" width={22} />
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
                <NotificationsCard className="w-full shadow-none" />
              </PopoverContent>
            </Popover>
          </NavbarItem>
          {/* User Menu */}
          <NavbarItem className="px-2">
            <Dropdown placement="bottom-end" classNames={{ content: "min-w-[260px]" }}>
              <DropdownTrigger>
                <button className="mt-1 h-8 w-8 outline-hidden transition-transform">
                  <Badge color="success" content="" placement="bottom-right" shape="circle">
                    <Avatar size="sm" src="https://i.pravatar.cc/150?u=a04258114e29526708c" />
                  </Badge>
                </button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Profile Actions" 
                variant="flat"
                classNames={{
                  base: "p-0",
                }}
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
                    key="help"
                    startContent={<Icon icon="solar:question-circle-linear" width={18} className="text-default-500" />}
                  >
                    Help & Feedback
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
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
          </NavbarItem>
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu>
          <NavbarMenuItem>
            <Link className="w-full" color="foreground" href="#">
              Dashboard
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem isActive>
            <Link aria-current="page" className="w-full" color="primary" href="#">
              Deployments
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link className="w-full" color="foreground" href="#">
              Analytics
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link className="w-full" color="foreground" href="#">
              Team
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link className="w-full" color="foreground" href="#">
              Settings
            </Link>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
      {/* Secondary Tabs Bar - Full Width */}
      <div className="w-full border-b border-divider">
        <ScrollShadow
          hideScrollBar
          className="flex w-full justify-between gap-8 px-4 sm:px-6"
          orientation="horizontal"
        >
          <Tabs
            aria-label="Navigation Tabs"
            classNames={{
              tabList: "w-full relative rounded-none p-0 gap-4 lg:gap-6",
              tab: "max-w-fit px-0 h-12",
              cursor: "w-full",
              tabContent: "text-default-400",
            }}
            radius="full"
            variant="underlined"
          >
            <Tab key="dashboard" title="Dashboard" />
            <Tab
              key="deployments"
              title={
                <div className="flex items-center gap-2">
                  <p>Deployments</p>
                  <Chip size="sm">9</Chip>
                </div>
              }
            />
            <Tab key="analytics" title="Analytics" />
            <Tab key="team" title="Team" />
            <Tab key="settings" title="Settings" />
          </Tabs>
        </ScrollShadow>
      </div>
    </div>
  );
}
