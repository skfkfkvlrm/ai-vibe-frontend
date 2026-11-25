import type { CSSProperties } from "react";

export const inputStyle: CSSProperties = {
    width: '60px',
    textAlign: 'right' as const,
    padding: "3px 2px",
    border: "none",
    outline: "2px solid #999",
    cursor: "pointer"
};
export const buttonStyle: CSSProperties = {
    backgroundColor: "#aaaaab",
    color: "#ffffff",
    padding: "10px 20px"
};
export const layoutStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #999",
    borderRadius: "6px",
    overflow: "hidden"
};