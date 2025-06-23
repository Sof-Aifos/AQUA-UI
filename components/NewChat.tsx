import React from "react";
import { Container } from "@mantine/core";

import { useRouter } from "next/router";


export default function NewChatCarousel() {
  const router = useRouter();

  return (
    <Container py="xl">
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h3>What would you like to know about the Venice lagoon?</h3>
      </div>
    </Container>
  );
}
