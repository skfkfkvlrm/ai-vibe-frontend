import { Fragment } from "react";

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            {children}
            <h2>
                기존 제품 외에도 많은 제품이 있사오니,
                하단 메일 주소로 연락 주시기 바랍니다.
            </h2>
        </html>
    );
}