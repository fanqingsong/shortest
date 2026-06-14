export type PageStateInfo = {
  url: string;
  title: string;
  snapshot: string;
  previousUrl?: string;
  previousTitle?: string;
};

export const PAGE_UNCHANGED_LINE = "- Page: (unchanged)";

export const STALE_TOOL_RESULT_PLACEHOLDER =
  "[Previous tool result omitted to save context.]";

export const truncateForContext = (
  text: string,
  maxChars: number,
): string => {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars).trimEnd()}…`;
};

export const PAGE_SECTION_HEADER = "### Page";

export const STALE_SNAPSHOT_PLACEHOLDER =
  "[Previous page snapshot omitted to save context. Call browser_snapshot for current refs.]";

/** Hint after successful ref actions — avoids re-sending the full snapshot. */
export const ACTION_SUCCESS_HINT =
  "Refs may be stale. Call browser_snapshot before the next interaction if the page changed.";

const PAGE_STATE_BLOCK_PATTERN = /\n?### Page[\s\S]*$/;

export const formatPageState = ({
  url,
  title,
  snapshot,
  previousUrl,
  previousTitle,
}: PageStateInfo): string => {
  const pageLines: string[] = [PAGE_SECTION_HEADER];

  const urlChanged = previousUrl === undefined || url !== previousUrl;
  const titleChanged = previousTitle === undefined || title !== previousTitle;

  if (urlChanged) {
    pageLines.push(`- Page URL: ${url}`);
  }
  if (titleChanged) {
    pageLines.push(`- Page Title: ${title}`);
  }
  if (!urlChanged && !titleChanged && previousUrl !== undefined) {
    pageLines.push(PAGE_UNCHANGED_LINE);
  }

  return [...pageLines, "### Snapshot", snapshot].join("\n");
};

/** Strips a trailing page/snapshot block and leaves a short placeholder. */
export const omitPageSnapshotText = (text: string): string => {
  if (!text.includes(PAGE_SECTION_HEADER)) {
    return text;
  }

  const withoutBlock = text.replace(PAGE_STATE_BLOCK_PATTERN, "").trimEnd();
  return `${withoutBlock}\n\n${STALE_SNAPSHOT_PLACEHOLDER}`;
};
