import { Page } from "playwright";
import { getConfig } from "@/index";
import {
  ACTION_SUCCESS_HINT,
  formatPageState,
} from "@/browser/snapshot/format-page-state";

export type AriaSnapshotSessionOptions = {
  depth?: number;
  interactiveOnly?: boolean;
};

const DEFAULT_SNAPSHOT_DEPTH = 12;

const REF_PATTERN = /\[ref=e\d+\]/;
const INTERACTIVE_ROLE_PATTERN =
  /^\s*-\s+(button|link|textbox|searchbox|combobox|checkbox|radio|switch|menuitem|tab|option|slider|spinbutton|heading|img)\b/i;

export const filterInteractiveSnapshot = (snapshot: string): string => {
  const trimmed = snapshot.trim();
  if (!trimmed) {
    return snapshot;
  }

  const filtered = trimmed
    .split("\n")
    .filter(
      (line) =>
        REF_PATTERN.test(line) && INTERACTIVE_ROLE_PATTERN.test(line),
    );

  return filtered.length > 0 ? filtered.join("\n") : snapshot;
};

export const getAriaSnapshotSessionOptions = (): AriaSnapshotSessionOptions => {
  const snapshot = getConfig().browser?.snapshot;
  return {
    depth: snapshot?.depth ?? DEFAULT_SNAPSHOT_DEPTH,
    interactiveOnly: snapshot?.interactiveOnly ?? true,
  };
};

export class AriaSnapshotSession {
  private page: Page;
  private depth?: number;
  private interactiveOnly: boolean;
  private lastSnapshot: string | null = null;
  private lastPageUrl?: string;
  private lastPageTitle?: string;

  constructor(page: Page, options: AriaSnapshotSessionOptions = {}) {
    this.page = page;
    this.depth = options.depth;
    this.interactiveOnly = options.interactiveOnly ?? true;
  }

  setPage(page: Page) {
    this.page = page;
    this.invalidate();
  }

  invalidate() {
    this.lastSnapshot = null;
    this.lastPageUrl = undefined;
    this.lastPageTitle = undefined;
  }

  normalizeRef(ref: string): string {
    const trimmed = ref.trim();
    if (trimmed.startsWith("ref=")) {
      return trimmed.slice(4);
    }
    return trimmed;
  }

  private locator(ref: string) {
    return this.page.locator(`aria-ref=${this.normalizeRef(ref)}`);
  }

  async capture(): Promise<string> {
    const snapshot = await this.page.ariaSnapshot({
      mode: "ai",
      ...(this.depth !== undefined ? { depth: this.depth } : {}),
    });
    const processed = this.interactiveOnly
      ? filterInteractiveSnapshot(snapshot)
      : snapshot;
    this.lastSnapshot = processed;
    return processed;
  }

  async captureFormatted(): Promise<string> {
    const snapshot = await this.capture();
    const url = this.page.url();
    const title = await this.page.title();
    const formatted = formatPageState({
      url,
      title,
      snapshot,
      previousUrl: this.lastPageUrl,
      previousTitle: this.lastPageTitle,
    });
    this.lastPageUrl = url;
    this.lastPageTitle = title;
    return formatted;
  }

  async snapshotOnly(): Promise<{ output: string }> {
    const output = await this.captureFormatted();
    return { output };
  }

  private async actionResult(
    successLine: string,
    error?: unknown,
  ): Promise<{ output: string }> {
    if (error !== undefined) {
      const message = error instanceof Error ? error.message : String(error);
      const output = `Failed: ${successLine}. ${message}\n\n${await this.captureFormatted()}`;
      return { output };
    }

    return {
      output: `${successLine} ${ACTION_SUCCESS_HINT}`,
    };
  }

  async click(ref: string): Promise<{ output: string }> {
    const normalizedRef = this.normalizeRef(ref);
    try {
      await this.locator(ref).click();
      this.invalidate();
      return await this.actionResult(`Clicked ${normalizedRef}.`);
    } catch (error) {
      this.invalidate();
      return await this.actionResult(`click ${normalizedRef}`, error);
    }
  }

  async fill(ref: string, text: string): Promise<{ output: string }> {
    const normalizedRef = this.normalizeRef(ref);
    try {
      await this.locator(ref).fill(text);
      this.invalidate();
      return await this.actionResult(`Filled ${normalizedRef}.`);
    } catch (error) {
      this.invalidate();
      return await this.actionResult(`fill ${normalizedRef}`, error);
    }
  }

  async press(ref: string, key: string): Promise<{ output: string }> {
    const normalizedRef = this.normalizeRef(ref);
    try {
      await this.locator(ref).press(key);
      this.invalidate();
      return await this.actionResult(
        `Pressed ${key} on ${normalizedRef}.`,
      );
    } catch (error) {
      this.invalidate();
      return await this.actionResult(
        `press ${key} on ${normalizedRef}`,
        error,
      );
    }
  }
}
