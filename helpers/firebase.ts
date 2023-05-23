import { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { AppCheck, initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { databaseUrls } from "./config";
import { getDatabase, increment, ref, set } from "firebase/database";
import { getPath } from "./misc";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);

// export const analytics = getAnalytics(app);

export let appCheck: AppCheck | undefined = undefined;
export const useAppCheck = () => {
  useEffect(() => {
    if (!appCheck) {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_FIREBASE_SITE_KEY as string),
        isTokenAutoRefreshEnabled: true,
      });
    }
  }, []);
};

export const auth = getAuth(app);

export const functions = getFunctions(app);

export const firestore = getFirestore(app);

export const storage = getStorage(app);

export const databases = {
  cache: getDatabase(app, databaseUrls.cache),
};

export const submitResult = httpsCallable<
  {
    votes: { total: number; none: number; rte: number; kk: number };
    storageUrl: string;
    imageUrl: string;
    city: string;
    district: string;
    neighborhood: string;
    box: string;
  },
  string | undefined
>(functions, "submitResult");

export async function updateClick({
  city,
  district,
  neighborhood,
  box,
  tag,
}: {
  city: string | undefined;
  district: string | undefined;
  neighborhood: string | undefined;
  box: string | undefined;
  tag: string;
}) {
  await set(
    ref(databases.cache, getPath(city, district, neighborhood, box).replace("results", "clicks") + "/" + tag),
    increment(1)
  );
}
