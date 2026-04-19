'use client';

export default function CSSLoader() {
  return (
    <>
      {/* Non-critical CSS loaded with low priority (media="print" trick + onload) */}
      <link
        rel="stylesheet"
        href="/non-critical.css"
        media="print"
        onLoad={(e) => (e.currentTarget.media = 'all')}
      />
      {/* Fallback for JS disabled */}
      <noscript>
        <link rel="stylesheet" href="/non-critical.css" />
      </noscript>
    </>
  );
}
