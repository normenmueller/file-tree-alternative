# feat/horizontal-scroll

https://github.com/normenmueller/file-tree-alternative/tree/feat/horizontal-scroll

## Enable horizontal scrolling in folder and file panes

Adds horizontal scrolling to the folder and file panes for long names, without ellipsis. Headers stay fixed while the lists scroll, and the file list uses a stable vertical scrollbar. Includes a small bookmarks utility fix required for a clean build.

Examples (illustrative):

- Long folder names can be read via horizontal scroll in the folder pane.
- Long file names can be read via horizontal scroll in the file pane.

## Changelog

- Allow horizontal scrolling in folder and file panes
- Remove ellipsis clipping for folder and file names
- Keep folder/file headers fixed while lists scroll horizontally
- Use stable vertical scrollbar for the file list
- Fix bookmarks utility signature to satisfy TypeScript build

## Tests

- Not run (manual testing only)
