import { API_BASE_URL } from "../constants";

export async function importConfluencePage(pageId) {
  const res = await fetch(`${API_BASE_URL}/confluence/import?page_id=${encodeURIComponent(pageId)}`);
  if (!res.ok) throw new Error('Failed to import from Confluence');
  return res.json();
}

export function extractPageIdFromUrl(url) {
  const match = String(url).match(/\/pages\/(\d+)/);
  return match ? match[1] : null;
}

export async function importConfluencePage(pageId) {
  const res = await fetch(`/api/confluence/import?page_id=${encodeURIComponent(pageId)}`);
  if (!res.ok) throw new Error('Failed to import from Confluence');
  return res.json();
}

export function extractPageIdFromUrl(url) {
  // works for .../wiki/spaces/{SPACE}/pages/{pageId}/...
  const match = String(url).match(/\/pages\/(\d+)/);
  return match ? match[1] : null;
}

