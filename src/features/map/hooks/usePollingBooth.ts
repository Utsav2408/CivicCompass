import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import type { PollingBooth } from "@shared/types/map";
import type { UserProfile } from "@shared/types/user";

export function usePollingBooth(uid: string | undefined) {
  const [booth, setBooth] = useState<PollingBooth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBooth(null);
       
      setIsLoading(false);
      return;
    }

    async function fetchBooth() {
      setIsLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "users", uid as string);
        const docSnap = await getDoc(docRef);

        if (isMounted) {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // The typing of pollingBooth might be partial in user profile but it's casted
            setBooth(data.pollingBooth ?? null);
          } else {
            setBooth(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch polling booth"),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchBooth();

    return () => {
      isMounted = false;
    };
  }, [uid]);

  return { booth, isLoading, error };
}
