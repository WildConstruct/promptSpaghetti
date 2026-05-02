import { useState, useEffect } from 'react';

export interface GraphVersion {
  id: string;
  version: number;
  createdAt: Date;
  description?: string;
  graphData: unknown;
}

export const useGraphVersions = (graphId: string) => {
  const [versions, setVersions] = useState<GraphVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Version persistence is not wired for this hook yet.
    setVersions([]);
  }, [graphId]);

  const saveVersion = async (description?: string) => {
    void description;
    setLoading(true);
    try {
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save version');
      setLoading(false);
    }
  };

  const loadVersion = async (versionId: string) => {
    void versionId;
    return null;
  };

  return {
    versions,
    loading,
    error,
    saveVersion,
    loadVersion
  };
};

export default useGraphVersions;
