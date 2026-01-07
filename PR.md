# feat-nav-by-arr-key

https://github.com/normenmueller/file-tree-alternative/tree/feat-nav-by-arr-key

## Add arrow-key navigation for folder pane

Implements keyboard navigation in the folder pane only: up/down moves between visible folders, left closes or moves to parent, and right opens or moves to the first child. This avoids opening notes from the file pane while still providing file-browser-like navigation. The active folder row now also shows the same light gray background as hover.

Examples (illustrative):

- ArrowDown selects the next visible folder.
- ArrowRight opens a closed folder or enters its first child when already open.

## Changelog

- Add folder-pane keydown handling and visible-folder traversal
- Highlight the active folder row with the hover background

## Tests

- Not run (manual testing only)
