import {type SidebarItem, SidebarItemType} from "./sidebar";

export const dashboardSidebarItems: SidebarItem[] = [
  {
    key: "main",
    title: "Main",
    items: [
      {
        key: "playground",
        icon: "solar:play-circle-linear",
        title: "Playground",
      },
      {
        key: "activity",
        icon: "solar:chart-square-linear",
        title: "Activity",
      },
      {
        key: "analytics",
        icon: "solar:chart-outline",
        title: "Analytics",
      },
      {
        key: "conversations",
        icon: "solar:chat-round-dots-linear",
        title: "Conversations",
      },
      {
        key: "data-sources",
        title: "Data Sources",
        icon: "solar:database-linear",
        type: SidebarItemType.Nest,
        items: [
          {
            key: "sources-files",
            icon: "solar:file-text-linear",
            title: "Files",
          },
          {
            key: "sources-text-snippets",
            icon: "solar:document-text-linear",
            title: "Text Snippets",
          },
          {
            key: "sources-website",
            icon: "solar:global-linear",
            title: "Website",
          },
          {
            key: "sources-qa",
            icon: "solar:chat-square-like-linear",
            title: "Q&A",
          },
          {
            key: "sources-integrations",
            icon: "solar:widget-linear",
            title: "Integrations",
          },
        ],
      },
      {
        key: "actions",
        icon: "solar:bolt-circle-linear",
        title: "Actions",
      },
      {
        key: "deploy",
        icon: "solar:cloud-upload-linear",
        title: "Deploy",
      },
    ],
  },
  {
    key: "settings-section",
    title: "Settings",
    items: [
      {
        key: "agent-settings",
        icon: "solar:settings-outline",
        title: "Agent Settings",
      },
    ],
  },
];
