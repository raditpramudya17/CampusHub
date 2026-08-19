import React from 'react';

// Renders **bold**, *italic* and `code` spans inside a single line as JSX.
function renderInline(text, keyPrefix) {
  const nodes = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let lastIndex = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${i++}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-${i++}`}>{match[2]}</em>);
    } else {
      nodes.push(
        <code key={`${keyPrefix}-${i++}`} className="font-mono text-[11.5px] bg-navy/10 px-1 py-0.5 rounded">
          {match[3]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/**
 * Small markdown renderer for chat replies — no library needed for this scope.
 * Local LLMs (Ollama) often run bullet markers together on one line instead of
 * real newlines ("... * **Deadline:** ... * **Fokus:** ..."), which looked like
 * asterisk soup when dumped as plain text. This normalizes those inline "* "/"- "
 * markers onto their own line first, then renders bullets as a real <ul> and
 * bold/italic/code spans as real inline formatting.
 */
export default function ChatMessage({ text }) {
  const normalized = String(text || '').replace(/\s+([*-])\s+(?=\S)/g, '\n$1 ');
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);

  const blocks = [];
  let currentList = null;
  lines.forEach((line) => {
    const bulletMatch = /^[*-]\s+(.*)/.exec(line);
    if (bulletMatch) {
      if (!currentList) {
        currentList = [];
        blocks.push(currentList);
      }
      currentList.push(bulletMatch[1]);
    } else {
      currentList = null;
      blocks.push(line);
    }
  });

  return (
    <div className="flex flex-col gap-1.5">
      {blocks.map((block, bi) =>
        Array.isArray(block) ? (
          <ul key={bi} className="list-disc pl-4 space-y-0.5">
            {block.map((item, ii) => (
              <li key={ii}>{renderInline(item, `${bi}-${ii}`)}</li>
            ))}
          </ul>
        ) : (
          <p key={bi} className="m-0">
            {renderInline(block, `${bi}`)}
          </p>
        )
      )}
    </div>
  );
}
