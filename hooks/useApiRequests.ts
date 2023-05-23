import { pause } from "../helpers/misc";
import { collection, doc, getDocs, limit, query, setDoc, where } from "firebase/firestore";
import { firestore } from "../helpers/firebase";
import { useEffect, useState } from "react";

// this was used to crawl data from oy-ve-otesi endpoints
// might also be needed later on for the same purpose
let lock = true;

const readUrl = async (url: string) => {
  for (let i = 0; i < 60; i++) {
    try {
      return await (await fetch(url)).json();
    } catch (e) {}
    await pause(1000);
  }
};

export default function () {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (lock) {
      return;
    } else {
      lock = true;
    }

    const main = async () => {
      try {
        while (true) {
          const rand = Math.random();
          const flag = Math.random() > 0.5;
          let snapshot = await getDocs(
            query(
              collection(firestore, "apiRequests"),
              where("rand", "!=", 1),
              where("rand", flag ? "<" : ">", rand),
              limit(1)
            )
          );
          if (snapshot.empty) {
            snapshot = await getDocs(
              query(
                collection(firestore, "apiRequests"),
                where("rand", "!=", 1),
                where("rand", flag ? ">" : "<", rand),
                limit(1)
              )
            );
          }

          if (!snapshot.empty) {
            const key = snapshot.docs[0].id;
            const url = snapshot.docs[0].data().url;
            const results = await Promise.all([readUrl(url), pause(1000)]);
            const response = results[0];
            if (response) {
              await setDoc(
                doc(firestore, "apiRequests", key),
                { response, rand: 1, update: Date.now() },
                { merge: true }
              );

              setCounter((c) => c + 1);
            } else {
              break;
            }
          } else {
            break;
          }
        }
      } catch (e: any) {
        // console.log(e);
      }
    };

    main();
  }, []);

  return counter;
}
