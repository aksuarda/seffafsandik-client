import { Dispatch, SetStateAction, useEffect } from "react";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { getMinMax } from "@/helpers/chart";
import { ResponsiveLine } from "@nivo/line";
import List from "../list";
import { getPercent, sortTR } from "@/helpers/misc";
import { updateClick } from "@/helpers/firebase";

const sourceMap: any = {
  aa: "AA",
  oyveotesi: "Oy ve Ötesi",
  ysk: "YSK",
  main: "Şeffaf Sandık",
};

type TModal = { tag: string; data: any; history: { tag: string; data: any }[] };
const getPath = (city: string | undefined, district: string | undefined, neighborhood: string | undefined) => {
  if (!city) {
    return "Türkiye";
  } else {
    let path = city;
    if (district) {
      path += ` / ${district}`;
      if (neighborhood) {
        path += ` / ${neighborhood}`;
      }
    }
    return path;
  }
};

export default function Chart({
  city,
  district,
  neighborhood,
  results,
  setModal,
}: {
  city: string;
  district: string;
  neighborhood: string;
  results: any;
  setModal: Dispatch<SetStateAction<TModal | undefined>>;
}) {
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInd, setLabelInd] = useState(-1);

  const [chart, setChart] = useState<any>(undefined);

  useEffect(() => {
    if (neighborhood) {
      setLabels(["Recep Tayyip Erdoğan", "Kemal Kılıçdaroğlu"]);
      setLabelInd(0);
    } else {
      setLabels(["Yüklenen Sonuç", "Recep Tayyip Erdoğan", "Kemal Kılıçdaroğlu"]);
      setLabelInd(0);
    }
  }, [neighborhood]);

  useEffect(() => {
    if (labelInd > -1) {
      updateClick({ city, district, neighborhood, box: undefined, tag: "chart/" + labels[labelInd] });

      const keys = Object.keys(results._).sort(sortTR);
      const data: any = [{ id: "blank", data: keys.map((e, i) => ({ x: keys[i], y: null })) }];
      for (const round of ["1", "2"]) {
        for (const source of ["aa", "oyveotesi", "main"]) {
          if (source === "aa" && (district || neighborhood)) {
            continue;
          }
          const _data = [];
          for (const key of keys) {
            if (
              results["_"][key][round][source] &&
              (results["_"][key][round][source].box || labels[labelInd] === "Yüklenen Sonuç")
            ) {
              _data.push({
                x: key,
                y:
                  labels[labelInd] === "Yüklenen Sonuç"
                    ? Number((results["_"][key][round][source].box / results["_"][key][round]["total"].box) * 100)
                    : labels[labelInd] === "Recep Tayyip Erdoğan"
                    ? Number(getPercent(results["_"][key][round], source, "rte"))
                    : labels[labelInd] === "Kemal Kılıçdaroğlu"
                    ? Number(getPercent(results["_"][key][round], source, "kk"))
                    : 0,
                round,
                source: sourceMap[source],
              });
            }
          }
          if (_data.length) {
            data.push({ id: round + " - " + sourceMap[source], data: _data });
          }
        }
      }

      const { min, max } = getMinMax(data, ["y"]);

      setChart({
        data,
        curve: "monotoneX",
        colors: { scheme: "set2" },
        yScale: { type: "linear", min, max },
        margin: { top: 30, right: 20, bottom: 20, left: 40 },
        enableGridX: false,
        enableArea: true,
        enableSlices: "x",
        areaBaselineValue: labels[labelInd] === "Yüklenen Sonuç" ? 0 : 50,
        useMesh: true,
        axisBottom: null, //{ tickRotation: -60 },
        axisLeft: { format: (d: any) => `%${d}` },
        markers: [],
        defs: [
          {
            id: "gradient",
            type: "linearGradient",
            colors: [
              { offset: 0, color: "inherit", opacity: 0 },
              { offset: 100, color: "inherit", opacity: 1 },
            ],
          },
        ],
        fill: [{ match: "*", id: "gradient" }],
        sliceTooltip: ({ slice }: any) => {
          const map: any = {};
          for (const point of slice.points) {
            if (!map[point.data.round]) {
              map[point.data.round] = [];
            }
            map[point.data.round].push({ color: point.serieColor, source: point.data.source, val: point.data.y });
          }
          return (
            <div
              style={{
                background: "white",
                padding: "9px 12px",
                border: "1px solid #ccc",
              }}
            >
              <div className="text-center">{slice.points?.[0]?.data?.x || ""}</div>
              {map[1] ? (
                <>
                  <div className="text-left">14 Mayıs</div>
                  {map[1].map((e: any) => (
                    <div key={Math.random()} style={{ color: e.color }}>
                      <strong>{e.source}</strong> %{e.val.toFixed(2)}
                    </div>
                  ))}
                </>
              ) : (
                <></>
              )}
              {map[2] ? (
                <>
                  <div className="mt-1 text-left">28 Mayıs</div>
                  {map[2].map((e: any) => (
                    <div key={Math.random()} style={{ color: e.color }}>
                      <strong>{e.source}</strong> %{e.val.toFixed(2)}
                    </div>
                  ))}
                </>
              ) : (
                <></>
              )}
            </div>
          );
        },
      });
    }
  }, [results, labelInd]);

  return (
    <div>
      <div className="mt-1 flex justify-center items-center">{getPath(city, district, neighborhood)} </div>
      <div className="mt-5 flex justify-end items-center">
        <List list={labels} ind={labelInd} setInd={setLabelInd} dispAll={false} cn={"w-36 mr-2"} />
      </div>
      <div className="h-96 flex items-center justify-center">
        {chart ? <ResponsiveLine {...chart} /> : <ClipLoader color="blue" speedMultiplier={1.5} />}
      </div>
    </div>
  );
}
