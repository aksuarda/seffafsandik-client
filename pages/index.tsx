const allboxes: any = require("../helpers/constants/boxes.json");
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, set, onValue, Unsubscribe, increment, push, onDisconnect, serverTimestamp } from "firebase/database";
import { motion } from "framer-motion";
import List from "@/components/list";
import Modal from "@/components/modal";
import { databases, firestore, updateClick, useAppCheck } from "@/helpers/firebase";
import { ClipLoader } from "react-spinners";
import clsx from "clsx";
import { getPath, getPercent, getPercentWithVotes, getSubmits, getTotalVotes } from "@/helpers/misc";
import useApiRequests from "@/hooks/useApiRequests";
import { Tooltip } from "@mui/material";
import { InfoOutlined, GitHub } from "@mui/icons-material";
import { Switch } from "@headlessui/react";
import Head from "next/head";
import Link from "next/link";
import useUser from "@/hooks/useUser";

type TModal = { tag: string; data: any; history: { tag: string; data: any }[] };

const cities = Object.keys(allboxes);

// todo: refactor components

export default function Home() {
  useAppCheck();

  const apiCounter = useApiRequests();

  const [results, setResults] = useState<any>(undefined);

  const [selection, setSelection] = useState<{
    city: undefined | string;
    district: undefined | string;
    neighborhood: undefined | string;
    box: undefined | string;
  }>({ city: undefined, district: undefined, neighborhood: undefined, box: undefined });

  const [modal, setModal] = useState<TModal | undefined>(undefined);

  const [cityInd, setCityInd] = useState(-1);
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtInd, setDistrictInd] = useState(-1);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [neighborhoodInd, setNeighborhoodInd] = useState(-1);
  const [boxes, setBoxes] = useState<string[]>([]);
  const [boxInd, setBoxInd] = useState(-1);

  const [enabled, setEnabled] = useState(false);

  const [info, setInfo] = useState<{ result?: string; upload?: string; verify?: string }>({});

  const { userId } = useUser();

  useEffect(() => {
    const t = Date.now();
    updateClick({
      city: cities[cityInd],
      district: districts[districtInd],
      neighborhood: neighborhoods[neighborhoodInd],
      box: boxes[boxInd],
      tag: "select",
    });

    return onSnapshot(
      doc(firestore, getPath(selection.city, selection.district, selection.neighborhood, selection.box)),
      (doc) => {
        console.log(Date.now() - t, doc.data());
        setResults(doc.data());
      }
    );
  }, [selection]);

  return (
    <>
      <Head>
        <title>Şeffaf Sandık</title>
        <meta name="description" content="Şeffaf Sandık Uygulaması" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div
          className="h-full bg-gray-50 text-gray-950"
          onMouseDown={() => {
            setInfo({});
          }}
        >
          <div className="fixed -z-10 inset-0 w-screen h-screen bg-gray-50" />
          {modal && <Modal modal={modal} setModal={setModal} />}
          <div className="h-12"></div>

          <div className="mt-3 flex justify-center items-center">
            <div className="mr-3 w-16">İl: </div>
            <List
              list={cities}
              ind={cityInd}
              setInd={(ind) => {
                if (ind === cityInd) {
                  return;
                }

                setResults(undefined);
                setSelection({
                  city: cities[ind],
                  district: undefined,
                  neighborhood: undefined,
                  box: undefined,
                });

                setBoxInd(-1);
                setNeighborhoodInd(-1);
                setDistrictInd(-1);
                setCityInd(ind);

                setBoxes([]);
                setNeighborhoods([]);
                if (ind > -1) {
                  setDistricts(Object.keys(allboxes[cities[ind]]));
                } else {
                  setDistricts([]);
                }
              }}
              cn={"w-24"}
            />
          </div>
          <div className="mt-3 flex justify-center items-center">
            <div className="mr-3 w-16">İlçe: </div>
            <List
              list={districts}
              ind={districtInd}
              setInd={(ind) => {
                if (ind === districtInd) {
                  return;
                }

                setResults(undefined);
                setSelection({
                  city: cities[cityInd],
                  district: districts[ind],
                  neighborhood: undefined,
                  box: undefined,
                });

                setBoxInd(-1);
                setNeighborhoodInd(-1);
                setDistrictInd(ind);

                setBoxes([]);
                if (ind > -1) {
                  setNeighborhoods(Object.keys(allboxes[cities[cityInd]][districts[ind]]));
                } else {
                  setNeighborhoods([]);
                }
              }}
              cn={"w-24"}
            />
          </div>
          <div className="mt-3 flex justify-center items-center">
            <div className="mr-3 w-16">Mahalle: </div>
            <List
              list={neighborhoods}
              ind={neighborhoodInd}
              setInd={(ind) => {
                if (ind === neighborhoodInd) {
                  return;
                }

                setResults(undefined);
                setSelection({
                  city: cities[cityInd],
                  district: districts[districtInd],
                  neighborhood: neighborhoods[ind],
                  box: undefined,
                });

                setBoxInd(-1);
                setNeighborhoodInd(ind);

                if (ind > -1) {
                  setBoxes(
                    allboxes[cities[cityInd]][districts[districtInd]][neighborhoods[ind]].map((e: any) => e.toString())
                  );
                } else {
                  setBoxes([]);
                }
              }}
              cn={"w-24"}
            />
          </div>
          <div className="mt-3 flex justify-center items-center">
            <div className="mr-3 w-16">Sandık: </div>
            <List
              list={boxes}
              ind={boxInd}
              setInd={(ind) => {
                if (ind === boxInd) {
                  return;
                }

                setResults(undefined);
                setSelection({
                  city: cities[cityInd],
                  district: districts[districtInd],
                  neighborhood: neighborhoods[neighborhoodInd],
                  box: boxes[ind],
                });

                setBoxInd(ind);
              }}
              cn={"w-24"}
            />
          </div>

          <div className="my-0 h-[45rem] flex items-center justify-center cursor-default">
            {results ? (
              <div className="relative">
                <>
                  <div className="mt-0 flex justify-center items-center">
                    <div className="">28 Mayıs</div>
                    <Tooltip
                      title="Sisteme herkes sonuç yükleyebilmekte ve yüklenen tüm sonuçları görüntüleyebilmektedir. 
                    Fakat olası suistimalleri engellemek amacıyla sonuçların ülke/il/ilçe/mahalle bazında işlenmesi ayrıca uygulanacak çok katılımlı bir doğrulama prosedürü ile birlikte gerçekleştirilecektir. 
                    (Doğrulama sistemi yeterli sayıda sonuç yüklenmesi halinde devreye alınacaktır.)"
                      placement="top"
                      enterTouchDelay={0}
                    >
                      <InfoOutlined sx={{ fontSize: 15 }} className="ml-1 mb-2 cursor-pointer" />
                    </Tooltip>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="mr-2">Recep Tayyip Erdoğan: </div>
                    <div className="">{getPercentWithVotes(results?.[2]?.main, "rte")}</div>
                  </div>
                  <div className="mt-1 flex justify-center">
                    <div className="mr-2">Kemal Kılıçdaroğlu: </div>
                    <div className="">{getPercentWithVotes(results?.[2]?.main, "kk")}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 text-center">
                    {boxInd === -1 ? (
                      <>
                        <div className="flex justify-center">
                          <div className="mr-2">Yüklenen sonuç: </div>
                          <div className="">{`%${(
                            (Math.max(results?.[2]?.main?.submit || 0, results?.[2]?.main?.box || 0) /
                              results?.[2]?.total?.box) *
                            100
                          ).toFixed(2)}`}</div>
                        </div>
                        <div className="mt-2 flex justify-center">
                          <div className="mr-2">Doğrulanan sonuç: </div>
                          <div className="">{`%${(
                            ((results?.[2]?.main?.box || 0) / results?.[2]?.total?.box) *
                            100
                          ).toFixed(2)}`}</div>
                        </div>
                      </>
                    ) : results?.[2]?.main?.box ? (
                      <>(Sonuç doğrulandı)</>
                    ) : getSubmits(results?.submits?.data, 2, "main").length ? (
                      <>(Doğrulama bekleniyor...)</>
                    ) : (
                      <>(Sonuç bekleniyor...)</>
                    )}
                  </div>
                  <Tooltip
                    title="14 Mayıs YSK verisi olmadığı için işlevsel değildir."
                    placement="top"
                    enterTouchDelay={0}
                  >
                    <div className="mt-3 flex justify-center text-sm text-gray-600">
                      <Switch.Group as="div" className="flex items-center">
                        <Switch
                          checked={enabled}
                          onChange={setEnabled}
                          className="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full outline-none ring-0 "
                        >
                          <span className="sr-only"></span>
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute h-full w-full rounded-md bg-white"
                          />
                          <span
                            aria-hidden="true"
                            className={clsx(
                              enabled ? "bg-gray-500" : "bg-gray-200",
                              "pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out"
                            )}
                          />
                          <span
                            aria-hidden="true"
                            className={clsx(
                              enabled ? "translate-x-5" : "translate-x-0",
                              "pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out"
                            )}
                          />
                        </Switch>
                        <Switch.Label as="span" className="ml-3 text-sm">
                          Yüklenmeyen yerlerde YSK verisi kullan
                        </Switch.Label>
                      </Switch.Group>
                    </div>
                  </Tooltip>
                </>

                <>
                  <div className="mt-6 flex justify-center items-center">
                    <div className="">14 Mayıs (YSK)</div>
                    <Tooltip
                      title="YSK kendi verilerini paylaşınca güncellenecektir :("
                      placement="top"
                      enterTouchDelay={0}
                    >
                      <InfoOutlined sx={{ fontSize: 15 }} className="ml-1 mb-2 cursor-pointer" />
                    </Tooltip>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="mr-2">Recep Tayyip Erdoğan: </div>
                    <div className="">{getPercentWithVotes(results?.[1]?.ysk, "rte")}</div>
                  </div>
                  <div className="mt-1 flex justify-center">
                    <div className="mr-2">Kemal Kılıçdaroğlu: </div>
                    <div className="">{`%${getPercentWithVotes(results?.[1]?.ysk, "kk")}`}</div>
                  </div>
                </>

                <>
                  <div className="mt-6 flex justify-center items-center">
                    <div className="">14 Mayıs (AA)</div>
                    <Tooltip
                      title="Anadolu Ajansının paylaştığı ilçe bazlı sonuçlardır. Sandık sonuçları bulunmamaktadır."
                      placement="top"
                      enterTouchDelay={0}
                    >
                      <InfoOutlined sx={{ fontSize: 15 }} className="ml-1 mb-2 cursor-pointer" />
                    </Tooltip>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="mr-2">Recep Tayyip Erdoğan: </div>
                    <div className="">{getPercentWithVotes(results?.[1]?.aa, "rte")}</div>
                  </div>
                  <div className="mt-1 flex justify-center">
                    <div className="mr-2">Kemal Kılıçdaroğlu: </div>
                    <div className="">{getPercentWithVotes(results?.[1]?.aa, "kk")}</div>
                  </div>
                </>

                <>
                  <div className="mt-6 flex justify-center">
                    {/* <Tooltip title={apiCounter} placement="right" enterTouchDelay={0}> */}
                    <div>14 Mayıs (Oy ve Ötesi)</div>
                    {/* </Tooltip> */}
                    <Tooltip
                      title="Oy ve Ötesi'nin paylaştığı tutanak verilerinden elde edilen sonuçlardır."
                      placement="top"
                      enterTouchDelay={0}
                    >
                      <InfoOutlined sx={{ fontSize: 15 }} className="ml-1 mb-2 cursor-pointer" />
                    </Tooltip>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="mr-2">Recep Tayyip Erdoğan: </div>
                    <div className="">{getPercentWithVotes(results?.[1]?.oyveotesi, "rte")}</div>
                  </div>
                  <div className="mt-1 flex justify-center">
                    <div className="mr-2">Kemal Kılıçdaroğlu: </div>
                    <div className="">{getPercentWithVotes(results?.[1]?.oyveotesi, "kk")}</div>
                  </div>
                  <div className="mt-2 flex justify-center text-sm text-gray-600">
                    {boxInd === -1 ? (
                      <>
                        <div className="mr-2">Yüklenen sonuç: </div>
                        <div className="">{`%${(
                          (results?.[1]?.oyveotesi?.box / results?.[1]?.total?.box) *
                          100
                        ).toFixed(2)}`}</div>
                      </>
                    ) : results?.[1]?.oyveotesi?.box ? (
                      <>(Sonuç var)</>
                    ) : (
                      <>(Sonuç yok)</>
                    )}
                  </div>
                </>

                <>
                  <div className="mt-6 flex justify-center items-center">
                    <div className="">2018 (YSK)</div>
                    <Tooltip title="Yurtdışı ve cezaevi sonuçları dahil değildir." placement="top" enterTouchDelay={0}>
                      <InfoOutlined sx={{ fontSize: 15 }} className="ml-1 mb-2 cursor-pointer" />
                    </Tooltip>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="mr-2">Recep Tayyip Erdoğan: </div>
                    <div className="">{getPercentWithVotes(results?.[0]?.ysk, "rte")}</div>
                  </div>
                  <div className="mt-1 flex justify-center">
                    <div className="mr-2">Muhalefet: </div>
                    <div className="">{`%${(100 - Number(getPercent(results?.[0]?.ysk, "rte"))).toFixed(
                      2
                    )}  (${new Intl.NumberFormat("en").format(
                      getTotalVotes(results?.[0]?.ysk) - (results?.[0]?.ysk?.rte || 0)
                    )})`}</div>
                  </div>
                </>
              </div>
            ) : (
              <ClipLoader color="blue" speedMultiplier={1.5} />
            )}
          </div>

          <div className="mt-0 flex justify-center">
            <motion.button
              whileTap={{ scale: false ? 1 : 0.95 }}
              transition={{ duration: 0 }}
              className={clsx(false ? "bg-gray-400" : "bg-gray-200", " h-9 w-36 rounded-md")}
              onClick={() => {
                if (boxInd > -1 && (results?.submits || results?.[1]?.oyveotesi?.box > 0)) {
                  setModal({
                    tag: "result",
                    data: {
                      city: cities[cityInd],
                      district: districts[districtInd],
                      neighborhood: neighborhoods[neighborhoodInd],
                      box: boxes[boxInd],
                      submits: results?.submits,
                    },
                    history: [],
                  });
                } else if (boxInd > -1) {
                  setInfo({ result: "Keşke olsa" });
                } else if (results) {
                  setModal({
                    tag: "chart",
                    data: {
                      city: cities[cityInd],
                      district: districts[districtInd],
                      neighborhood: neighborhoods[neighborhoodInd],
                      box: boxes[boxInd],
                      results,
                    },
                    history: [],
                  });
                }
              }}
              disabled={false}
            >
              Sonuç Göster
            </motion.button>
          </div>
          <div className="mt-0 flex justify-center text-xs text-red-500 h-2">{info.result}</div>
          <div className="mt-5 flex justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0 }}
              className="bg-gray-200 h-9 w-36 rounded-md"
              onClick={() => {
                if (cityInd > -1 && districtInd > -1 && boxInd > -1) {
                  setModal({
                    tag: "upload",
                    data: {
                      userId,
                      city: cities[cityInd],
                      district: districts[districtInd],
                      neighborhood: neighborhoods[neighborhoodInd],
                      box: boxes[boxInd],
                    },
                    history: [],
                  });
                } else {
                  setInfo({ upload: "Sandık seçilmedi" });
                }
              }}
            >
              Sonuç Yükle
            </motion.button>
          </div>
          <div className="mt-0 flex justify-center text-xs text-red-500 h-2">{info.upload}</div>
          <div className="mt-5 flex justify-center">
            <Tooltip
              title={"Doğrulama sistemi yeterli sayıda sonuç yüklenmesi halinde devreye alınacaktır."}
              placement="bottom"
              enterDelay={0}
              enterTouchDelay={0}
              followCursor
            >
              <motion.button
                whileTap={{ scale: 1 }}
                transition={{ duration: 0 }}
                className="bg-gray-400 h-9 w-36 rounded-md cursor-default"
                onClick={() => {}}
              >
                Sonuç Doğrula
              </motion.button>
            </Tooltip>
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              href="https://github.com/aksuarda/seffafsandik-client"
              onClick={() => {
                updateClick({
                  city: undefined,
                  district: undefined,
                  neighborhood: undefined,
                  box: undefined,
                  tag: "github",
                });
              }}
            >
              {/* <Tooltip title={userId} placement="top" enterDelay={5000}> */}
              <GitHub color="disabled" />
              {/* </Tooltip> */}
            </Link>
          </div>
          <div className="h-12"></div>
        </div>
      </main>
    </>
  );
}
