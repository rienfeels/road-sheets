"use client";

import React from "react";

export function ConfirmSubmitButton({
  children,
  confirmText,
  style,
}: {
  children: React.ReactNode;
  confirmText: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      style={style as any}
    >
      {children}
    </button>
  );
}
