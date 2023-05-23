import { Dispatch, SetStateAction, useEffect } from "react";
import { useState } from "react";
// import Image from "next/image";

import {
  NavigateBefore,
  NavigateNext,
  ThumbDown,
  ThumbDownAltOutlined,
  ThumbUp,
  ThumbUpOffAltOutlined,
} from "@mui/icons-material";
import { ClipLoader } from "react-spinners";
import { updateClick } from "@/helpers/firebase";

type TSubmits = { id: string | undefined; data: any };
type TModal = { tag: string; data: any; history: { tag: string; data: any }[] };

export default function Upload({
  city,
  district,
  neighborhood,
  box,
  submits,
  setModal,
}: {
  city: string;
  district: string;
  neighborhood: string;
  box: string;
  submits: TSubmits;
  setModal: Dispatch<SetStateAction<TModal | undefined>>;
}) {
  const [id, setId] = useState<string>("");

  const [navigation, setNavigation] = useState<{ prev: string | undefined; next: string | undefined }>({
    prev: undefined,
    next: undefined,
  });

  const [vote, setVote] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    updateClick({ city, district, neighborhood, box, tag: "result" });

    setId((id) => id || submits?.id || Object.keys(submits?.data || {}).sort((a, b) => Number(b) - Number(a))[0] || "");
  }, []);

  useEffect(() => {
    const ids = Object.keys(submits?.data || {}).sort((a, b) => Number(b) - Number(a));
    const ind = ids.findIndex((e) => e && e === id);
    setVote(undefined);
    setNavigation({ prev: ids[ind - 1], next: ids[ind + 1] });
  }, [id]);

  return (
    <>
      {submits && id.length ? (
        <div>
          <div className="mt-3 flex justify-center items-center">
            {submits.data[id].round === 1
              ? "14 Mayıs" + (submits.data[id].tag === "oyveotesi" ? " (Oy ve Ötesi)" : "")
              : "28 Mayıs"}
          </div>
          <div className="mt-3 flex justify-center items-center">
            {`${city} / ${district} / ${neighborhood} / ${box} `}{" "}
          </div>
          <div className="mt-6 flex justify-center items-center">
            <div className="mr-1 w-44">Kayıtlı seçmen: </div>
            <div className="mr-1 w-10 text-right">{submits.data[id].votes.total ?? ""}</div>
          </div>
          <div className="mt-1 flex justify-center items-center">
            <div className="mr-1 w-44">Geçersiz: </div>
            <div className="mr-1 w-10 text-right">{submits.data[id].votes.none ?? ""}</div>
          </div>
          <div className="mt-1 flex justify-center items-center">
            <div className="mr-1 w-44">Recep Tayyip Erdoğan: </div>
            <div className="mr-1 w-10 text-right">{submits.data[id].votes.rte ?? ""}</div>
          </div>
          <div className="mt-1 flex justify-center items-center">
            <div className="mr-1 w-44">Kemal Kılıçdaroğlu: </div>
            <div className="mr-1 w-10 text-right">{submits.data[id].votes.kk ?? ""}</div>
          </div>
          {submits.data[id].imageUrl ? (
            // <Image src={submits.data[id].imageUrl} alt={""} width={1500} height={1500} className="mx-auto mt-12" />
            <img src={submits.data[id].imageUrl} alt={submits.data[id].imageUrl} className="mx-auto mt-12" />
          ) : (
            <div />
          )}
          <div className="mt-12 flex justify-between items-center">
            <NavigateBefore
              fontSize={"large"}
              sx={{ border: 1 }}
              color={navigation.prev ? "inherit" : "disabled"}
              className={navigation.prev ? "cursor-pointer" : "cursor-inherit"}
              onClick={() => {
                navigation.prev && setId(navigation.prev);
              }}
            />
            <div className="mt-3 flex justify-between items-center">
              {vote === true ? (
                <ThumbUp fontSize="large" />
              ) : (
                <ThumbUpOffAltOutlined
                  fontSize="large"
                  className="cursor-pointer"
                  onClick={() => {
                    setVote(true);
                  }}
                />
              )}
              <div className="mx-4 text-lg"></div>
              {vote === false ? (
                <ThumbDown fontSize="large" />
              ) : (
                <ThumbDownAltOutlined
                  fontSize="large"
                  className="cursor-pointer"
                  onClick={() => {
                    setVote(false);
                  }}
                />
              )}
            </div>
            <NavigateNext
              fontSize={"large"}
              sx={{ border: 1 }}
              color={navigation.next ? "inherit" : "disabled"}
              className={navigation.next ? "cursor-pointer" : "cursor-inherit"}
              onClick={() => {
                navigation.next && setId(navigation.next);
              }}
            />
          </div>
          <div className="mt-8 flex justify-center text-xs text-center">
            Dikkat: Oylamalar arka planda çalışan bir repütasyon sistemine dayanmaktadır. Verdiğiniz oyların doğruluğu
            repütasyonunuzu arttırır ve sonuçların daha hızlı işlenmesini sağlar. Fazla sayıda hatalı oy vermeniz
            durumunda ise oylama yetkiniz kaldırılır ve önceki verdiğiniz tüm oylar iptal edilir.
          </div>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center">
          <ClipLoader color="blue" speedMultiplier={1.5} />
        </div>
      )}
    </>
  );
}
