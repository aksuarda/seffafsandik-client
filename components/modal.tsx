import { Dispatch, Fragment, SetStateAction } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Upload from "./modals/upload";
import Result from "./modals/result";
import Chart from "./modals/chart";
import { Close } from "@mui/icons-material";

type TModal = { tag: string; data: any; history: { tag: string; data: any }[] };

export default function Modal({
  modal,
  setModal,
}: {
  modal: TModal | undefined;
  setModal: Dispatch<SetStateAction<TModal | undefined>>;
}) {
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setModal(undefined);
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* <div className="fixed inset-0 bg-black bg-opacity-25" /> */}
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-auto scrollbar-none">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="cursor-default w-full max-w-2xl transform overflow-visible rounded-2xl bg-gray-50 text-gray-950 p-10 text-left align-middle shadow-xl transition-all">
                <div
                  className="flex justify-end -mt-3 cursor-pointer"
                  onClick={() => {
                    setModal(undefined);
                  }}
                >
                  <Close color="disabled"></Close>
                </div>
                {modal?.tag === "upload" ? (
                  <Upload setModal={setModal} {...modal.data} />
                ) : modal?.tag === "result" ? (
                  <Result setModal={setModal} {...modal.data} />
                ) : modal?.tag === "chart" ? (
                  <Chart setModal={setModal} {...modal.data} />
                ) : (
                  <div />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
