"use client";

import { Box, Container, Flex } from "@chakra-ui/react";
import { ISidebarItem, Sidebar } from "@/components/Sidebar";

const sidebarItems: ISidebarItem[] = [
  { name: "Standard", href: "/" },
  { name: "Pirate", href: "/pirate" },
  { name: "Translate", href: "/translate" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Container h="100vh" maxW="container.lg" p="10px">
      <Flex h="100%" w="100%">
        <Sidebar items={sidebarItems} flex="1" p="20px" />
        <Box h="100%" flex="3" borderWidth="1px" rounded="xl" p="20px">
          {children}
        </Box>
      </Flex>
    </Container>
  );
}
