import MarkedReact from "marked-react";

function MarkdownRenderer({ content = "" }) {
  return (
    <MarkedReact
      renderer={{
        link(href, text) {
          return (
            <a className="text-customPurple underline" href={href} rel="noopener noreferrer" target="_blank">
              {text}
            </a>
          );
        },
        heading(children) {
          return <h3 className="font-medium text-lg mb-1">{children}</h3>;
        },
      }}
      breaks
      gfm
    >
      {content}
    </MarkedReact>
  );
}

export default MarkdownRenderer;
