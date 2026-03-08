export type MessagingChatMessageProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar: string;
  name: string;
  message: string;
  time?: string;
  isRTL?: boolean;
  imageUrl?: string;
  classNames?: Record<"base", string>;
};
