"use client";

import React from "react";
import {useDisclosure} from "@heroui/react";
import {useMediaQuery} from "usehooks-ts";
import {AnimatePresence, domAnimation, LazyMotion, m} from "framer-motion";

import MessagingChatInbox from "./messaging-chat-inbox";
import MessagingChatWindow from "./messaging-chat-window";
import MessagingChatProfile from "./messaging-chat-profile";
import SidebarDrawer from "./sidebar-drawer";
import MessagingChatHeader from "./messaging-chat-header";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
};

export default function ConversationsPage() {
  const [[page, direction], setPage] = React.useState([0, 0]);
  const {isOpen: isProfileSidebarOpen, onOpenChange: onProfileSidebarOpenChange} = useDisclosure();

  const isCompact = useMediaQuery("(max-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const paginate = React.useCallback(
    (newDirection: number) => {
      setPage((prev) => {
        if (!isCompact) return prev;

        const currentPage = prev[0];

        if (currentPage < 0 || currentPage > 2) return [currentPage, prev[1]];

        return [currentPage + newDirection, newDirection];
      });
    },
    [isCompact],
  );

  const content = React.useMemo(() => {
    let component = <MessagingChatInbox page={page} paginate={paginate} />;

    if (isCompact) {
      switch (page) {
        case 1:
          component = <MessagingChatWindow paginate={paginate} />;
          break;
        case 2:
          component = <MessagingChatProfile paginate={paginate} />;
          break;
      }

      return (
        <LazyMotion features={domAnimation}>
          <m.div
            key={page}
            animate="center"
            className="col-span-12"
            custom={direction}
            exit="exit"
            initial="enter"
            transition={{
              x: {type: "spring", stiffness: 300, damping: 30},
              opacity: {duration: 0.2},
            }}
            variants={variants}
          >
            {component}
          </m.div>
        </LazyMotion>
      );
    }

    return (
      <>
        <MessagingChatInbox className="lg:col-span-6 xl:col-span-4 overflow-hidden" />
        <MessagingChatWindow
          className="lg:col-span-6 xl:col-span-5 overflow-hidden"
          toggleMessagingProfileSidebar={onProfileSidebarOpenChange}
        />
        <div className="hidden xl:col-span-3 xl:block overflow-hidden">
          <SidebarDrawer
            className="xl:block"
            isOpen={isProfileSidebarOpen}
            sidebarPlacement="right"
            sidebarWidth={320}
            onOpenChange={onProfileSidebarOpenChange}
          >
            <MessagingChatProfile />
          </SidebarDrawer>
        </div>
      </>
    );
  }, [isCompact, page, paginate, direction, isProfileSidebarOpen, onProfileSidebarOpenChange]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="sm:rounded-large sm:border-small sm:border-default-200 grid flex-1 min-h-0 grid-cols-12 grid-rows-[auto_1fr] gap-0 overflow-hidden p-0 sm:grid-rows-1">
        <MessagingChatHeader
          aria-hidden={!isMobile}
          className="col-span-12 sm:hidden"
          page={page}
          paginate={paginate}
        />
        {isCompact ? (
          <AnimatePresence custom={direction} initial={false} mode="wait">
            {content}
          </AnimatePresence>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
