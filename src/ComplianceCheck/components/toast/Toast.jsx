import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { useToast } from "../../contexts/ToastContext";
import CheckIcon from "./CheckIcon";
import ErrorIcon from "./ErrorIcon";
import WarnIcon from "./WarnIcon";
import InfoIcon from "./InfoIcon";

const typeStyles = {
  success: "text-[#6a0]",
  error: "text-red-500",
  warn: "text-yellow-500",
  info: "text-blue-500",
};

const typeIcons = {
  success: <CheckIcon width={20} height={20} color={"green"} />,
  error: <ErrorIcon width={20} height={20} color={"red"} />,
  warn: <WarnIcon width={20} height={20} color={"yellow"} />,
  info: <InfoIcon width={20} height={20} color={"lightblue"} />,
};

const Toast = ({ id, message, type, duration = 3000 }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(true);

  const closeToast = useCallback(() => {
    setIsVisible(false);
    removeToast(id);
  }, [removeToast, id]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(closeToast, 500);
  }, [closeToast]);

  useEffect(() => {
    const hide = setTimeout(() => {
      setIsVisible(false);
      setTimeout(closeToast, 500);
    }, duration);

    return () => clearTimeout(hide);
  }, [closeToast, duration]);

  return (
    <div
      className={clsx(
        `w-60 my-2 px-4 py-2 rounded-none bg-[#fffc] shadow transition-transform`,
        typeStyles[type],
        {
          "animate-toastIn": isVisible,
          "animate-toastOut": !isVisible,
        }
      )}
      onClick={handleClose}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-1 mt-[1px]">{typeIcons[type]}</div>
          <span className="flex items-center text-xs mr-1">{message}</span>
        </div>
        <span
          className="cursor-pointer text-[#000a] hover:bg-gray-200 rounded-full w-6 h-6 flex justify-center items-center transition-all"
          onClick={handleClose}
        >
          <Icon name={"x"} size={24} />
        </span>
      </div>
    </div>
  );
};

export default Toast;
