import { getStrategiesByOwner } from "@/services/defi-module-service";
import { useEffect, useState } from "react";

export const useStrategies = (ownerId?: string) => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ownerId) return;

    const fetchStrategies = async () => {
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

    fetchStrategies();
  }, [ownerId]);

  return { strategies, loading };
};