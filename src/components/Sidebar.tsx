import { Box, Link, Stack, type StackProps } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export type ISidebarItem = {
  name: string;
  href: string;
};

function SidebarItem({ item }: { item: ISidebarItem }) {
  const [bgColor, setBgColor] = useState("");
  useEffect(() => {
    if (window.location.pathname == item.href) {
      setBgColor("rgba(255, 255, 255, 0.05)");
    }
  }, [item.href]);
  return (
    <Link href={item.href} _hover={{ textDecoration: "none" }}>
      <Box
        p="10px"
        bgColor={bgColor}
        rounded="md"
        _hover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      >
        {item.name}
      </Box>
    </Link>
  );
}

interface SidebarProps extends StackProps {
  items: ISidebarItem[];
}

export function Sidebar(props: SidebarProps) {
  return (
    <Stack p="10px" {...props}>
      {props.items.map((item) => (
        <SidebarItem item={item} key={item.name} />
      ))}
    </Stack>
  );
}
