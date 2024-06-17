"use client";

import { Text, Stack, Input, Button, Flex, Box } from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

type Message = {
  sender: "model" | "user";
  text: string;
};

export function Chatbox() {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Array<Message>>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [disabled, setDisabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const formSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    setMessageText("");
    inputRef.current!.placeholder = "Thinking...";
    setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
    let response = "";
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_HOST + "/send_message",
        {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({ message: messageText }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const reader = res.body!.getReader();
      setMessages((prev) => [...prev, { sender: "model", text: response }]);
      let done, value;
      while (!done) {
        ({ value, done } = await reader.read());
        response += new TextDecoder().decode(value);
        setMessages((prev) => [
          ...prev.slice(0, prev.length - 1),
          { sender: "model", text: response + "&#11044;" },
        ]);
      }
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        { sender: "model", text: response },
      ]);
    } catch {
      alert("An error occurred! Please try again!");
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        { sender: "model", text: response + "&#9760;" },
      ]);
      fetch(process.env.NEXT_PUBLIC_API_HOST + "/rewind");
    } finally {
      setDisabled(false);
      inputRef.current!.focus();
      inputRef.current!.placeholder = "Send a message";
    }
  };

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_HOST + "/start_chat", {
      method: "POST",
      body: JSON.stringify({ url: window.location.href }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      console.log(res.status, await res.text());
    });
    setDisabled(false);
    inputRef.current!.focus();
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo(0, messagesRef.current?.scrollHeight);
  }, [messages]);

  return (
    <Stack h="100%" gap="20px">
      <Flex alignItems="baseline" gap="5px">
        <Text fontSize="x-large" fontWeight="700">
          AntGPT
        </Text>
        <Text fontSize="small" opacity=".8">
          Gemini 1.5 Flash
        </Text>
      </Flex>
      <Stack
        h="100%"
        overflow="scroll"
        gap="20px"
        scrollBehavior="smooth"
        ref={messagesRef}
      >
        {messages.map((message, i) => (
          <Stack key={i}>
            <Text textTransform="capitalize" fontWeight="700">
              {message.sender}
            </Text>
            <Markdown>{message.text}</Markdown>
          </Stack>
        ))}
      </Stack>

      <form onSubmit={formSubmit}>
        <Flex gap="5px">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Send a message"
            disabled={disabled}
            ref={inputRef}
            tabIndex={0}
            required
          />
          <Button type="submit" padding="10px" isDisabled={disabled}>
            <ArrowUpIcon w="100%" h="100%" />
          </Button>
        </Flex>
      </form>
    </Stack>
  );
}
