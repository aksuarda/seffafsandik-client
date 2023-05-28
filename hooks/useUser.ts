import { makeid } from "../helpers/misc";
import { databases } from "../helpers/firebase";
import { useEffect, useState } from "react";
import { increment, onDisconnect, onValue, push, ref, serverTimestamp, set, update } from "firebase/database";

export default function () {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    return onValue(ref(databases.cache, ".info"), async (snapshot) => {
      if (snapshot.val()?.connected) {
        let userId = localStorage.getItem("userId");

        if (!userId) {
          userId =
            (
              await push(ref(databases.cache, "users"), {
                timeCreated: serverTimestamp(),
                timeUpdate: serverTimestamp(),
                logins: 1,
              })
            ).key || makeid(20);
          localStorage.setItem("userId", userId);

          set(ref(databases.cache, "presence/alltime"), increment(1));
        } else {
          update(ref(databases.cache, `users/${userId}`), {
            timeUpdate: serverTimestamp(),
            logins: increment(1),
          });
        }

        const refUser = ref(databases.cache, `presence/users/${userId}`);
        onDisconnect(refUser).remove();
        set(refUser, serverTimestamp());

        const refCount = ref(databases.cache, "presence/count");
        onDisconnect(refCount).set(increment(-1));
        set(refCount, increment(1));

        setUserId(userId);
      }
    });
  }, []);

  return { userId };
}
