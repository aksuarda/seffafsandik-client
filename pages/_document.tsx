import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full bg-gray-50 scrollbar-none">
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Play&display=swap" />
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
