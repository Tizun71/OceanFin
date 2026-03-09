import { getStrategiesByOwner } from "@/services/defi-module-service";
import { useEffect, useState } from "react";

export const useStrategies = (ownerId?: string) => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStrategies = async () => {
    if (!ownerId) return;

    setLoading(true);
    try {
      const data = await getStrategiesByOwner(ownerId);
      setStrategies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, [ownerId]);

  return {
    strategies,
    loading,
    refetch: fetchStrategies, 
  };
};