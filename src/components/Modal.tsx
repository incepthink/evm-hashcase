import { X } from "lucide-react";
import React from "react";
import { Work_Sans } from "next/font/google";

const workSans = Work_Sans({ subsets: ["latin"] });

interface ModalProps {
  openModal: boolean;
  onClose: () => void;
  context: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  openModal,
  onClose,
  context,
  children,
}) => {
  const CloseModal = () => {
    onClose();
  };
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 flex justify-center items-center z-[99999] transition-colors ${
        openModal ? "visible bg-black/20" : "invisible"
      } `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#00041F]/20 backdrop-blur-md text-white rounded-xl  shadow md:p-8 p-3 transition-all ${
          openModal ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
      >
        <div className="flex items-center justify-between gap-x-4">
          <h1
            className={`${workSans.className} md:text-2xl text-lg mb-2 mx-4 font-bold`}
          >
            {context}
          </h1>
          <button
            onClick={CloseModal}
            className="mb-2 rounded-lg text-gray-400"
          >
            <X />
          </button>
        </div>
        <hr />
        {children}
      </div>
    </div>
  );
};

export default Modal;
