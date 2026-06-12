export type PageStateInfo = {
  url: string;
  title: string;
  snapshot: string;
};

export const formatPageState = ({
  url,
  title,
  snapshot,
}: PageStateInfo): string => {
  return [
    "### Page",
    `- Page URL: ${url}`,
    `- Page Title: ${title}`,
    "### Snapshot",
    snapshot,
  ].join("\n");
};
