import { Dispatch, SetStateAction, useEffect } from "react";
import { storage, submitResult, updateClick } from "@/helpers/firebase";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { makeid } from "@/helpers/misc";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

type TModal = { tag: string; data: any; history: { tag: string; data: any }[] };

export default function Upload({
  city,
  district,
  neighborhood,
  box,
  setModal,
}: {
  city: string;
  district: string;
  neighborhood: string;
  box: string;
  setModal: Dispatch<SetStateAction<TModal | undefined>>;
}) {
  const [total, setTotal] = useState("");
  const [none, setNone] = useState("");
  const [kk, setKK] = useState("");
  const [rte, setRTE] = useState("");

  const [image, setImage] = useState<File | undefined>(undefined);

  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateClick({ city, district, neighborhood, box, tag: "upload" });
  }, []);

  return (
    <div
      onMouseDown={() => {
        setInfo("");
      }}
    >
      <div className="mt-3 flex justify-center items-center">{city} </div>
      <div className="mt-1 flex justify-center items-center">{district} </div>
      <div className="mt-1 flex justify-center items-center">{neighborhood} </div>
      <div className="mt-1 flex justify-center items-center">{box} </div>
      <div className="mt-10 flex justify-center items-center">
        <div className="mr-1 w-44">Kayıtlı seçmen: </div>
        <input
          className={clsx(
            Number(total || "-") >= 0 && Number.isInteger(Number(total)) ? "" : "ring-1 ring-red-500",
            "block w-14 rounded-md py-0 pl-2 outline-none focus:outline-none"
          )}
          placeholder=""
          value={total}
          onChange={(e) => {
            e.preventDefault();
            setTotal(e.target.value || "");
          }}
        />
      </div>
      <div className="mt-3 flex justify-center items-center">
        <div className="mr-1 w-44">Geçersiz: </div>
        <input
          className={clsx(
            Number(none || "-") >= 0 && Number.isInteger(Number(none)) ? "" : "ring-1 ring-red-500",
            "block w-14 rounded-md py-0 pl-2 outline-none focus:outline-none"
          )}
          placeholder=""
          value={none}
          onChange={(e) => {
            e.preventDefault();
            setNone(e.target.value || "");
          }}
        />
      </div>
      <div className="mt-3 flex justify-center items-center">
        <div className="mr-1 w-44">Recep Tayyip Erdoğan: </div>
        <input
          className={clsx(
            Number(rte || "-") >= 0 && Number.isInteger(Number(rte)) ? "" : "ring-1 ring-red-500",
            "block w-14 rounded-md py-0 pl-2 outline-none focus:outline-none"
          )}
          placeholder=""
          value={rte}
          onChange={(e) => {
            e.preventDefault();
            setRTE(e.target.value || "");
          }}
        />
      </div>
      <div className="mt-3 flex justify-center items-center">
        <div className="mr-1 w-44">Kemal Kılıçdaroğlu: </div>
        <input
          className={clsx(
            Number(kk || "-") >= 0 && Number.isInteger(Number(kk)) ? "" : "ring-1 ring-red-500",
            "block w-14 rounded-md py-0 pl-2 outline-none focus:outline-none"
          )}
          placeholder=""
          value={kk}
          onChange={(e) => {
            e.preventDefault();
            setKK(e.target.value || "");
          }}
        />
      </div>
      <div className="mt-12 flex justify-center">
        {/* <input type="file" accept="image/*" onChange={() => {}} /> */}
        <input
          className={clsx(image ? "" : "text-red-500")}
          type="button"
          id="selectimage"
          value={image ? image.name : "Fotoğraf seç..."}
          onClick={() => {
            document.getElementById("file")?.click();
          }}
        />
        <input
          type="file"
          hidden
          id="file"
          name="file"
          onChange={(e) => {
            setImage(e.target.files?.[0]);
          }}
        />
      </div>
      <div className="mt-14 flex justify-center">
        <motion.button
          whileTap={{ scale: loading ? 1 : 0.95 }}
          transition={{ duration: 0 }}
          className={clsx(loading ? "bg-gray-400" : "bg-gray-300", " h-8 w-32 rounded-md")}
          onClick={async () => {
            setLoading(true);
            try {
              const votes = {
                total: Number(total || "-"),
                none: Number(none || "-"),
                rte: Number(rte || "-"),
                kk: Number(kk || "-"),
              };
              if (isNaN(votes.total) || isNaN(votes.none) || isNaN(votes.rte) || isNaN(votes.kk)) {
                setInfo("Oy sayıları hatalı");
              } else {
                if (!image || !image.size) {
                  setInfo("Fotoğraf seçilmedi");
                } else {
                  const storageUrl = `${city}/${district}/${neighborhood}/${box}/${makeid(7, true, true)}`;
                  const storageRef = ref(storage, storageUrl);
                  const snapshot = await uploadBytes(storageRef, image);
                  const imageUrl = await getDownloadURL(snapshot.ref);

                  const response = await submitResult({
                    city,
                    district,
                    neighborhood,
                    box,
                    votes,
                    storageUrl,
                    imageUrl,
                  });

                  console.log("response", response);

                  if (response.data) {
                    setInfo("Sonuçlar yüklenemedi");
                  } else {
                    setModal(undefined);
                  }
                }
              }
            } catch (e) {
              console.log(e);
              setInfo("Sonuçlar yüklenemedi");
            }
            setLoading(false);
          }}
          disabled={loading}
        >
          {loading ? "Yükleniyor..." : "Yükle"}
        </motion.button>
      </div>
      <div className="mt-1 text-red-500 flex justify-center text-xs h-3">{info}</div>
      <div className="mt-2 flex justify-center text-xs text-center">
        Dikkat: Yüklediğiniz sonucun hatalı çıkması halinde önceki yüklediğiniz tüm sonuçlar silinecek ve yeni sonuç
        yüklemeniz engellenecektir.
      </div>
    </div>
  );
}
