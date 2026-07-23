"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";

// Faz o styled-jsx renderizar o CSS já no HTML do servidor (SSR), eliminando o
// flash de conteúdo sem estilo (FOUC) — a página já chega estilizada.
export default function StyledJsxRegistry({ children }) {
  const [registry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = registry.styles();
    registry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={registry}>{children}</StyleRegistry>;
}
