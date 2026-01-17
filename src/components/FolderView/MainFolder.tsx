import React, { useMemo, useRef } from 'react';
import Tree from 'components/FolderView/treeComponent/TreeComponent';
import FileTreeAlternativePlugin from 'main';
import ConditionalRootFolderWrapper from 'components/FolderView/ConditionalWrapper';
import { useRecoilState } from 'recoil';
import * as recoilState from 'recoil/pluginState';
import { NestedFolders } from 'components/FolderView/NestedFolders';
import { TFolder, Menu } from 'obsidian';
import { VaultChangeModal } from 'modals';
import * as Icons from 'utils/icons';
import { FolderSortType } from 'settings';
import useForceUpdate from 'hooks/ForceUpdate';
import { FolderTree } from 'utils/types';

interface FolderProps {
    plugin: FileTreeAlternativePlugin;
}

export function MainFolder(props: FolderProps) {
    const treeStyles = { color: 'var(--text-muted)', fill: '#c16ff7', width: '100%' };
    const plugin = props.plugin;
    const app = plugin.app;
    const rootFolder = app.vault.getRoot();

    // Global States
    const [activeFolderPath, setActiveFolderPath] = useRecoilState(recoilState.activeFolderPath);
    const [folderTree] = useRecoilState(recoilState.folderTree);
    const [focusedFolder, setFocusedFolder] = useRecoilState(recoilState.focusedFolder);
    const [openFolders, setOpenFolders] = useRecoilState(recoilState.openFolders);
    const [folderFileCountMap] = useRecoilState(recoilState.folderFileCountMap);

    const folderPaneRef = useRef<HTMLDivElement>(null);

    // Force Update
    const forceUpdate = useForceUpdate();

    const focusOnFolder = (folder: TFolder) => {
        setFocusedFolder(folder);
        setActiveFolderPath(folder.path);
    };

    const createFolder = (underFolder: TFolder) => {
        let vaultChangeModal = new VaultChangeModal(plugin, underFolder, 'create folder');
        vaultChangeModal.open();
    };

    const handleRootFolderContextMenu = (event: MouseEvent, folder: TFolder) => {
        // Event Undefined Correction
        let e = event;
        if (event === undefined) e = window.event as MouseEvent;

        // Menu Items
        const folderMenu = new Menu();

        folderMenu.addItem((menuItem) => {
            menuItem
                .setTitle('New Folder')
                .setIcon('folder')
                .onClick((ev: MouseEvent) => createFolder(folder));
        });

        if (!folder.isRoot()) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Focus Back to Root')
                    .setIcon('zoomOutDoubleIcon')
                    .onClick(() => focusOnFolder(rootFolder));
            });
        }

        if (folder.parent && !folder.parent.isRoot() && folder.parent !== focusedFolder) {
            folderMenu.addItem((menuItem) => {
                menuItem
                    .setTitle('Focus to Parent Folder')
                    .setIcon('zoomOutIcon')
                    .onClick(() => focusOnFolder(folder.parent));
            });
        }

        // Trigger
        app.workspace.trigger('root-folder-menu', folderMenu, folder);
        folderMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    };

    // --> Collapse, Expland Button Functions
    const collapseAllFolders = () => setOpenFolders([]);

    const explandAllFolders = () => {
        let newOpenFolders: string[] = [];

        newOpenFolders.push(folderTree.folder.path);

        const recursiveFx = (folderTreeChildren: FolderTree[]) => {
            for (let folderTreeChild of folderTreeChildren) {
                newOpenFolders.push(folderTreeChild.folder.path);
                if (folderTreeChild.children.length > 0) {
                    recursiveFx(folderTreeChild.children);
                }
            }
        };

        recursiveFx(folderTree.children);
        setOpenFolders(newOpenFolders);
    };

    const triggerFolderSortOptions = (e: React.MouseEvent) => {
        const sortMenu = new Menu();

        const changeSortSettingTo = (newValue: FolderSortType) => {
            plugin.settings.sortFoldersBy = newValue;
            plugin.saveSettings();
            forceUpdate();
        };

        sortMenu.addItem((menuItem) => {
            menuItem.setTitle('Folder Name (A to Z)');
            menuItem.onClick((ev: MouseEvent) => {
                changeSortSettingTo('name');
            });
        });

        if (plugin.settings.folderCount) {
            sortMenu.addItem((menuItem) => {
                menuItem.setTitle('Item Numbers (Bigger to Smaller)');
                menuItem.onClick((ev: MouseEvent) => {
                    changeSortSettingTo('item-number');
                });
            });
        }

        // Trigger
        plugin.app.workspace.trigger('sort-menu', sortMenu);
        sortMenu.showAtPosition({ x: e.pageX, y: e.pageY });
        return false;
    };

    const handleFolderNameDoubleClick = (folder: TFolder) => {
        if (!folder.isRoot()) focusOnFolder(folder.parent);
    };

    const getSortedFolderTree = (tree: FolderTree[]) => {
        let newTree = tree;
        newTree = newTree.sort((a, b) => {
            if (plugin.settings.sortFoldersBy === 'name') {
                return a.folder.name.localeCompare(b.folder.name, 'en', { numeric: true });
            } else if (plugin.settings.sortFoldersBy === 'item-number') {
                let aCount = folderFileCountMap[a.folder.path] ? folderFileCountMap[a.folder.path].closed : 0;
                let bCount = folderFileCountMap[b.folder.path] ? folderFileCountMap[b.folder.path].closed : 0;
                return bCount - aCount;
            }
        });
        return newTree;
    };

    const folderTreeMap = useMemo(() => {
        const map = new Map<string, FolderTree>();
        if (!folderTree) return map;
        const walk = (node: FolderTree) => {
            map.set(node.folder.path, node);
            if (node.children) {
                for (let child of node.children) {
                    walk(child);
                }
            }
        };
        walk(folderTree);
        return map;
    }, [folderTree]);

    const visibleFolders = useMemo(() => {
        if (!folderTree) return [];
        let result: TFolder[] = [];
        const walkChildren = (children: FolderTree[]) => {
            const sorted = getSortedFolderTree(children);
            for (let child of sorted) {
                result.push(child.folder);
                if (openFolders.contains(child.folder.path)) {
                    walkChildren(child.children);
                }
            }
        };
        result.push(folderTree.folder);
        walkChildren(folderTree.children);
        return result;
    }, [folderTree, openFolders, plugin.settings.sortFoldersBy, folderFileCountMap]);

    const scrollToFolder = (folder: TFolder) => {
        const selector = `div.oz-folder-contents div.oz-folder-element[data-path="${folder.path}"]`;
        const folderElement = document.querySelector(selector) as HTMLElement | null;
        if (!folderElement) return;

        folderElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });

        const scrollContainer = folderPaneRef.current;
        if (!scrollContainer) return;
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = folderElement.getBoundingClientRect();
        const leftOverflow = elementRect.left - containerRect.left;
        const rightOverflow = elementRect.right - containerRect.right;
        if (leftOverflow < 0) {
            scrollContainer.scrollLeft += leftOverflow;
        } else if (rightOverflow > 0) {
            scrollContainer.scrollLeft += rightOverflow;
        }
    };

    const focusFolderPane = () => folderPaneRef.current?.focus();

    const isEditableTarget = (target: EventTarget | null) => {
        const element = target as HTMLElement | null;
        if (!element) return false;
        const editable = element.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]') as HTMLElement | null;
        if (!editable) return false;
        if (editable.tagName === 'INPUT' && (editable as HTMLInputElement).type === 'file') return false;
        return true;
    };

    const restoreFocus = () => window.setTimeout(() => focusFolderPane(), 0);

    const setActiveAndScroll = (folder: TFolder) => {
        setActiveFolderPath(folder.path);
        scrollToFolder(folder);
    };

    const handleFolderPaneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].contains(e.key)) return;
        if (isEditableTarget(e.target)) return;
        if (!folderTree || visibleFolders.length === 0) return;
        e.preventDefault();
        e.stopPropagation();

        const currentPath = activeFolderPath || focusedFolder?.path || folderTree.folder.path;
        let currentIndex = visibleFolders.findIndex((folder) => folder.path === currentPath);
        if (currentIndex < 0) currentIndex = 0;
        const currentFolder = visibleFolders[currentIndex];

        if (e.key === 'ArrowUp') {
            if (currentIndex > 0) setActiveAndScroll(visibleFolders[currentIndex - 1]);
            restoreFocus();
            return;
        }

        if (e.key === 'ArrowDown') {
            if (currentIndex < visibleFolders.length - 1) setActiveAndScroll(visibleFolders[currentIndex + 1]);
            restoreFocus();
            return;
        }

        if (e.key === 'ArrowLeft') {
            const isOpen = openFolders.contains(currentFolder.path);
            if (isOpen) {
                const newOpenFolders = openFolders.filter((openFolder) => openFolder !== currentFolder.path);
                setOpenFolders(newOpenFolders);
                restoreFocus();
                return;
            }

            const parent = currentFolder.parent;
            if (parent) {
                if (focusedFolder && currentFolder.path === focusedFolder.path && !focusedFolder.isRoot()) {
                    focusOnFolder(parent);
                    window.setTimeout(() => scrollToFolder(parent), 0);
                } else {
                    setActiveAndScroll(parent);
                }
            }
            restoreFocus();
            return;
        }

        if (e.key === 'ArrowRight') {
            const treeNode = folderTreeMap.get(currentFolder.path);
            const children = treeNode?.children ?? [];
            if (children.length === 0) return;

            const isOpen = openFolders.contains(currentFolder.path);
            if (!isOpen && currentFolder.path !== focusedFolder?.path) {
                setOpenFolders([...openFolders, currentFolder.path]);
                restoreFocus();
                return;
            }

            const sortedChildren = getSortedFolderTree(children);
            const firstChild = sortedChildren[0]?.folder;
            if (firstChild) setActiveAndScroll(firstChild);
            restoreFocus();
        }
    };

    let folderActionItemSize = 22;

    return (
        <div className="oz-folders-tree-wrapper" ref={folderPaneRef} tabIndex={0} onMouseDown={focusFolderPane} onKeyDown={handleFolderPaneKeyDown}>
            <div className="oz-folders-action-items file-tree-header-fixed">
                <Icons.MdOutlineCreateNewFolder
                    className="oz-nav-action-button"
                    size={folderActionItemSize}
                    onClick={(e) => createFolder(plugin.app.vault.getRoot())}
                    aria-label="Create Folder"
                />
                <Icons.CgSortAz
                    className="oz-nav-action-button"
                    size={folderActionItemSize}
                    onClick={triggerFolderSortOptions}
                    aria-label="Sorting Options"
                />
                <Icons.CgChevronDoubleUp
                    className="oz-nav-action-button"
                    size={folderActionItemSize}
                    onClick={collapseAllFolders}
                    aria-label="Collapse Folders"
                />
                <Icons.CgChevronDoubleDown
                    className="oz-nav-action-button"
                    size={folderActionItemSize}
                    onClick={explandAllFolders}
                    aria-label="Expand Folders"
                />
            </div>
            <ConditionalRootFolderWrapper
                condition={(focusedFolder && !focusedFolder.isRoot()) || (focusedFolder && focusedFolder.isRoot && plugin.settings.showRootFolder)}
                wrapper={(children) => {
                    return (
                        <Tree
                            plugin={plugin}
                            content={focusedFolder.isRoot() ? plugin.app.vault.getName() : focusedFolder.name}
                            open
                            isRootFolder={focusedFolder.isRoot()}
                            style={treeStyles}
                            onClick={() => setActiveFolderPath(focusedFolder.path)}
                            onDoubleClick={() => handleFolderNameDoubleClick(focusedFolder)}
                            folder={focusedFolder}
                            onContextMenu={(e: MouseEvent) => handleRootFolderContextMenu(e, focusedFolder)}>
                            {children}
                        </Tree>
                    );
                }}>
                {folderTree && <NestedFolders plugin={plugin} folderTree={folderTree} />}
            </ConditionalRootFolderWrapper>
        </div>
    );
}
