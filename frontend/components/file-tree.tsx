"use client";

import { useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  File
} from "lucide-react";

interface Props {
  name: string;
  node: any;
  parentPath: string;
  onSelectFile: (path: string) => void;
}

export default function FileTree({
  name,
  node,
  parentPath,
  onSelectFile,
}: Props) {
  const [open, setOpen] = useState(false);

  const currentPath = parentPath ? `${parentPath}/${name}` : name;
  const isFile = node === null;

  // FILE
  if (isFile) {
    return (
      <div
        onClick={() => onSelectFile(currentPath)}
        className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
      >
        <File size={14} />
        <span className="truncate">{name}</span>
      </div>
    );
  }

  // FOLDER
  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
      >
        <ChevronRight
          size={14}
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        />

        {open ? <FolderOpen size={14} /> : <Folder size={14} />}

        <span className="truncate">{name}</span>
      </div>

      {open && (
        <div className="ml-4">
          {Object.entries(node).map(([childName, childNode]: any) => (
            <FileTree
              key={childName}
              name={childName}
              node={childNode}
              parentPath={currentPath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}