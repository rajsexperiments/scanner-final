import { DurableObject } from "cloudflare:workers";
// The Durable Object is no longer used for inventory persistence,
// as all data is now managed in Google Sheets via Google Apps Script.
// This class remains as part of the project's core architecture but is now empty.
// **DO NOT MODIFY THE CLASS NAME**
export class GlobalDurableObject extends DurableObject {
    // All inventory-related methods have been removed.
}