import { Page } from "playwright";
import { formatPageState } from "@/browser/snapshot/format-page-state";

export type AriaSnapshotSessionOptions = {
  depth?: number;
};

export class AriaSnapshotSession {
  private page: Page;
  private depth?: number;
  private lastSnapshot: string | null = null;

  constructor(page: Page, options: AriaSnapshotSessionOptions = {}) {
    this.page = page;
    this.depth = options.depth;
  }

  setPage(page: Page) {
    this.page = page;
    this.invalidate();
  }

  invalidate() {
    this.lastSnapshot = null;
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
    this.lastSnapshot = snapshot;
    return snapshot;
  }

  async captureFormatted(): Promise<string> {
    const snapshot = await this.capture();
    const url = this.page.url();
    const title = await this.page.title();
    return formatPageState({ url, title, snapshot });
  }

  async snapshotOnly(): Promise<{ output: string }> {
    const output = await this.captureFormatted();
    return { output };
  }

  async click(ref: string): Promise<{ output: string }> {
    try {
      await this.locator(ref).click();
      this.invalidate();
      const output = `Clicked ${this.normalizeRef(ref)}\n\n${await this.captureFormatted()}`;
      return { output };
    } catch (error) {
      this.invalidate();
      const message = error instanceof Error ? error.message : String(error);
      const output = `Failed to click ${this.normalizeRef(ref)}: ${message}\n\n${await this.captureFormatted()}`;
      return { output };
    }
  }

  async fill(ref: string, text: string): Promise<{ output: string }> {
    try {
      await this.locator(ref).fill(text);
      this.invalidate();
      const output = `Filled ${this.normalizeRef(ref)}\n\n${await this.captureFormatted()}`;
      return { output };
    } catch (error) {
      this.invalidate();
      const message = error instanceof Error ? error.message : String(error);
      const output = `Failed to fill ${this.normalizeRef(ref)}: ${message}\n\n${await this.captureFormatted()}`;
      return { output };
    }
  }

  async press(ref: string, key: string): Promise<{ output: string }> {
    try {
      await this.locator(ref).press(key);
      this.invalidate();
      const output = `Pressed ${key} on ${this.normalizeRef(ref)}\n\n${await this.captureFormatted()}`;
      return { output };
    } catch (error) {
      this.invalidate();
      const message = error instanceof Error ? error.message : String(error);
      const output = `Failed to press ${key} on ${this.normalizeRef(ref)}: ${message}\n\n${await this.captureFormatted()}`;
      return { output };
    }
  }
}
