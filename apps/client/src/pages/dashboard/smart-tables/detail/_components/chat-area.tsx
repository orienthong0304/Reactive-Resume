import { t } from "@lingui/macro";
import { Copy } from "@phosphor-icons/react";
import { ChatDto } from "@reactive-resume/dto";
import { Button } from "@reactive-resume/ui";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import TextareaAutosize from "react-textarea-autosize";
import remarkGfm from "remark-gfm";

import { useToast } from "@/client/hooks/use-toast";
import { UserAvatar } from "@/client/components/user-avatar";

type ChatAreaProps = {
  chats: ChatDto[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  streamingMessage: string;
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  chats,
  loading,
  onSendMessage,
  streamingMessage,
}) => {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats, streamingMessage]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    } else {
      toast({
        title: t`错误`,
        description: t`请输入消息内容`,
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t`成功`,
        description: t`内容已复制到剪贴板`,
      });
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast({
        title: t`错误`,
        description: t`复制失败，请重试`,
      });
    }
  };

  const renderMessage = React.useMemo(
    () => (content: string) => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                {...(props as any)}
                style={tomorrow}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <table className="my-2 border-collapse border border-gray-300">{children}</table>
            );
          },
          th({ children }) {
            return <th className="border border-gray-300 bg-gray-100 px-4 py-2">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-gray-300 px-4 py-2">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    ),
    [],
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col bg-background p-4 shadow-md h-full">
      <div ref={chatContainerRef} className="mb-4 flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`mb-4 flex ${chat.isUser ? "justify-end" : "justify-start"}`}
          >
            {!chat.isUser && <UserAvatar size={32} className="mr-2 self-end" />}
            <div className={`group ${chat.isUser ? "max-w-[70%]" : "max-w-[80%]"}`}>
              <div
                className={`relative rounded-lg p-3 ${
                  chat.isUser ? "bg-primary/10" : "bg-secondary"
                }`}
              >
                {renderMessage(chat.message)}
                {!chat.isUser && (
                  <Button
                    size="icon"
                    variant="ghost"
                    title={t`Copy`}
                    className="absolute bottom-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => copyToClipboard(chat.message)}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="mb-4 flex justify-start">
            <UserAvatar size={32} className="mr-2 self-end" />
            <div className="relative max-w-[80%] rounded-lg bg-secondary p-3">
              {renderMessage(streamingMessage)}
            </div>
          </div>
        )}
        {chats.length === 0 && !streamingMessage && (
          <div className="text-center text-muted-foreground">
            {t`No messages yet. Start a conversation!`}
          </div>
        )}
      </div>
      <div className="flex items-end">
        <TextareaAutosize
          value={message}
          placeholder={t`Type your message...`}
          className="mr-2 flex-1 resize-none rounded-md border border-input bg-background p-2 focus:border-ring focus:outline-none"
          minRows={1}
          maxRows={5}
          aria-label={t`Message input`}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyPress={handleKeyPress}
        />
        <Button
          disabled={loading}
          aria-label={loading ? t`Sending message` : t`Send message`}
          className="mb-1"
          onClick={handleSend}
        >
          {loading ? t`Sending...` : t`Send`}
        </Button>
      </div>
    </div>
  );
};
