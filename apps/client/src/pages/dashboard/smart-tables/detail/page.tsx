import { t } from "@lingui/macro";
import { ChatCompletionMessageParam } from "openai/resources";
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import { useToast } from "@/client/hooks/use-toast";
import { openai } from "@/client/services/openai/client";
import { useChats, useCreateChat, useSmartTable } from "@/client/services/smart-table";

import { ChatArea } from "./_components/chat-area";
import { Header } from "./_components/header";
import { TableDataArea } from "./_components/tabledata-area";

export const SmartTableDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { smartTable, loading: smartTableLoading } = useSmartTable(id ?? "");
  const { chats, loading: chatsLoading } = useChats(id ?? "");
  const { createChat, loading: createChatLoading } = useCreateChat();
  const [streamingMessage, setStreamingMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (smartTable) {
      const tableData = JSON.stringify(smartTable.data);
      setSystemPrompt(
        `你是一个智能助手，可以回答关于智能表格的问题。以下是表格数据：${tableData} 请基于这些数据回答用户的问题。使用 md 格式回复详细。`,
      );
    }
  }, [smartTable]);

  const conversationHistory = useMemo(() => {
    return (chats ?? []).map((chat) => ({
      role: chat.isUser ? "user" : "assistant",
      content: chat.message,
    })) as ChatCompletionMessageParam[];
  }, [chats]);

  const sendMessage = async (message: string) => {
    if (!id) {
      toast({
        title: t`错误`,
        description: t`无法发送消息，Smart Table ID 不存在。`,
      });
      return;
    }

    try {
      await createChat({ smartTableId: id, message, isUser: true });
      setStreamingMessage("");

      const client = openai();
      const stream = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: message },
        ],
        stream: true,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        fullResponse += content;
        setStreamingMessage(fullResponse);
      }

      await createChat({ smartTableId: id, message: fullResponse, isUser: false });
      setStreamingMessage("");
    } catch (error) {
      console.error(t`Error calling OpenAI:`, error);
      await createChat({
        smartTableId: id,
        message: t`抱歉，发生了错误。请稍后再试。`,
        isUser: false,
      });
      setStreamingMessage("");
      toast({
        title: t`错误`,
        description: t`生成回复时出错，请重试`,
      });
    }
  };

  if (smartTableLoading || chatsLoading) {
    return <div className="flex h-screen items-center justify-center">{t`加载中...`}</div>;
  }

  if (!smartTable) {
    return (
      <div className="flex h-screen items-center justify-center">
        {t`未找到 Smart Table，请检查 URL 是否正确。`}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {smartTable.title} - {t`Smart Tables`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
        <Header title={smartTable.title} />

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 overflow-y-auto">
            <ChatArea
              chats={chats ?? []}
              loading={createChatLoading}
              streamingMessage={streamingMessage}
              onSendMessage={sendMessage}
            />
          </div>
          <div className="w-1/2 overflow-y-auto">
            <TableDataArea smartTable={smartTable} />
          </div>
        </div>
      </div>
    </>
  );
};
