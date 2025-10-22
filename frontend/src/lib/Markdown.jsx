import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";

// Pick any theme you like (github.css, atom-one-dark.css, etc)
import "highlight.js/styles/github.css";

export default function Markdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}   // **bold**, lists, tables, and single \n → <br/>
      rehypePlugins={[rehypeHighlight]}           // code block highlighting
      components={{
        p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
        h1: ({ children }) => <h3 style={{ margin: "0 0 .4rem" }}>{children}</h3>,
        h2: ({ children }) => <h4 style={{ margin: "0 0 .35rem" }}>{children}</h4>,
        h3: ({ children }) => <h5 style={{ margin: "0 0 .3rem" }}>{children}</h5>,
        code: ({ inline, className, children, ...props }) => (
          <code
            className={className}
            style={{
              background: inline ? "#f6f6f6" : undefined,
              padding: inline ? "2px 4px" : undefined,
              borderRadius: inline ? 4 : undefined,
            }}
            {...props}
          >
            {children}
          </code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}