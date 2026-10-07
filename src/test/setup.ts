import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import "dotenv/config";

// jsdom does not implement <dialog> modality.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
  };
}
