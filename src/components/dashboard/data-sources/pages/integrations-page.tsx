"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  connected: boolean;
  comingSoon?: boolean;
}

const integrations: Integration[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Import documents, spreadsheets, and files from your Google Drive.",
    icon: "simple-icons:googledrive",
    iconColor: "#4285F4",
    connected: false,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync your Notion pages and databases to train your AI.",
    icon: "simple-icons:notion",
    iconColor: "#000000",
    connected: false,
  },
  {
    id: "excel",
    name: "Microsoft Excel",
    description: "Connect Excel files and spreadsheets from OneDrive.",
    icon: "simple-icons:microsoftexcel",
    iconColor: "#217346",
    connected: false,
    comingSoon: true,
  },
  {
    id: "clickup",
    name: "ClickUp",
    description: "Import tasks, docs, and knowledge base from ClickUp.",
    icon: "simple-icons:clickup",
    iconColor: "#7B68EE",
    connected: false,
    comingSoon: true,
  },
];

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

function IntegrationCard({ integration, onConnect, onDisconnect }: IntegrationCardProps) {
  const { id, name, description, icon, iconColor, connected, comingSoon } = integration;

  return (
    <Card
      className={cn(
        "border border-divider shadow-none transition-all",
        !comingSoon && "hover:border-default-300 hover:shadow-sm",
        comingSoon && "opacity-70"
      )}
      isHoverable={!comingSoon}
    >
      <CardBody className="gap-3 p-4">
        <div className="flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon
              icon={icon}
              width={28}
              style={{ color: iconColor }}
            />
          </div>
          {connected && (
            <Chip
              size="sm"
              color="success"
              variant="flat"
              startContent={<Icon icon="solar:check-circle-bold" width={14} />}
            >
              Connected
            </Chip>
          )}
          {comingSoon && (
            <Chip
              size="sm"
              color="default"
              variant="flat"
            >
              Coming soon
            </Chip>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-default-500 line-clamp-2">{description}</p>
        </div>
      </CardBody>
      <CardFooter className="border-t border-divider px-4 py-3">
        {comingSoon ? (
          <Button
            size="sm"
            variant="flat"
            isDisabled
            className="w-full"
          >
            Coming Soon
          </Button>
        ) : connected ? (
          <div className="flex w-full gap-2">
            <Button
              size="sm"
              variant="flat"
              className="flex-1"
              startContent={<Icon icon="solar:settings-linear" width={16} />}
            >
              Configure
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={() => onDisconnect(id)}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            color="primary"
            className="w-full"
            onPress={() => onConnect(id)}
            startContent={<Icon icon="solar:link-linear" width={16} />}
          >
            Connect
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function IntegrationsPage() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

  const handleConnect = (id: string) => {
    setConnectedIntegrations((prev) => [...prev, id]);
  };

  const handleDisconnect = (id: string) => {
    setConnectedIntegrations((prev) => prev.filter((i) => i !== id));
  };

  const integrationsWithStatus = integrations.map((integration) => ({
    ...integration,
    connected: connectedIntegrations.includes(integration.id),
  }));

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* Header - Full Width */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Integrations</h1>
          <p className="text-sm text-default-500">
            Connect third-party services to import data and expand your AI agent&apos;s knowledge.
          </p>
        </div>
        <Button
          variant="bordered"
          size="sm"
          startContent={<Icon icon="solar:info-circle-linear" width={16} />}
        >
          Learn more
        </Button>
      </div>

      {/* Integrations Grid */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {integrationsWithStatus.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>
    </div>
  );
}
