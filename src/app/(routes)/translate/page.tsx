"use client";

import { Textarea, Button, Flex, Text, Input, Stack } from "@chakra-ui/react";
import { FormEvent, useState } from "react";

export default function Page() {
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTranslation("Thinking...");
    fetch(process.env.NEXT_PUBLIC_API_HOST + "/translate", {
      method: "POST",
      body: JSON.stringify({
        target_lang: targetLang || "English",
        text: text,
        url: window.location.href,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setLoading(false);
        setSourceLang(res.source_lang + " (auto-detected)");
        setTranslation(res.translation);
      })
      .catch(() => {
        setLoading(false);
        setTranslation("☠️");
      });
  };

  return (
    <Flex flexDirection="column" alignItems="center" gap="10px" height="100%">
      <Flex alignItems="baseline" alignSelf="flex-start" gap="5px">
        <Text fontSize="x-large" fontWeight="700">
          Translate
        </Text>
        <Text fontSize="small" opacity=".8">
          Gemini 1.5 Flash
        </Text>
      </Flex>
      <form style={{ display: "contents" }} onSubmit={handleClick}>
        <Textarea
          flex="1"
          resize="none"
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          required
        />
        <Input
          placeholder="Source language: auto-detect"
          value={sourceLang}
          disabled={true}
        />
        <Button w="100%" type="submit">
          Translate with Gemini
        </Button>
        <Input
          placeholder="Target language: English (default), Chinese, Esperanto, etc."
          value={targetLang}
          onChange={(e) => setTargetLang(e.currentTarget.value)}
          required
        />
      </form>
      <Textarea
        flex="1"
        resize="none"
        contentEditable="false"
        value={translation}
        disabled={loading}
        readOnly
      />
    </Flex>
  );
}
