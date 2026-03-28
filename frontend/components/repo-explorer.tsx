"use client";

import { buildTree } from "@/lib/buildTree";
import { useEffect, useState } from "react";
import FileTree from "./file-tree";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  repoId: string;
  onSelectFile: (path: string) => void;
}

export default function RepoExplorer({ repoId, onSelectFile }: Props) {
  const [tree, setTree] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTree = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/explorer/tree/${repoId}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setTree(buildTree(data.files || []));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [repoId]);

  return (
    <div className="h-full flex flex-col">

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-6 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading...
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="flex flex-col items-center py-6 text-sm text-gray-500">
          <AlertCircle size={16} className="mb-2" />
          <span>Failed to load</span>

          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={fetchTree}
          >
            Retry
          </Button>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && Object.keys(tree).length === 0 && (
        <div className="py-6 text-sm text-gray-500 text-center">
          No files
        </div>
      )}

      {/* TREE */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto">
          {Object.entries(tree).map(([name, node]: any) => (
            <FileTree
              key={name}
              name={name}
              node={node}
              parentPath=""
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}