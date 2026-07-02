import { toast } from "sonner";
export const showSuccessToast = (msg, txHash = null, network) => {
  toast.success(
    <div className="flex  items-center justify-between">
      <span>{msg}</span>
      {txHash && network && (
        <button
          onClick={() =>
            window.open(
              `https://stellar.expert/explorer/${network?.toLowerCase()}/tx/${txHash}`,
              "_blank"
            )
          }
          className="ml-4 text-green-600 underline hover:text-green-800"
        >
          View in Explorer
        </button>
      )}
    </div>
  );
};

// const get_error_message = (value) => {
//   if (!value) return "Something went wrong";

//   // string
//   if (typeof value === "string") return value;

//   // native Error
//   if (value instanceof Error) return value.message;

//   // axios / fetch style
//   if (value?.response?.data) {
//     const data = value.response.data;

//     if (typeof data === "string") return data;
//     if (typeof data?.message === "string") return data.message;
//     if (typeof data?.error === "string") return data.error;
//   }

//   // direct object fields
//   if (typeof value?.message === "string") return value.message;
//   if (typeof value?.error === "string") return value.error;

//   // nested error object
//   if (value?.error && typeof value.error === "object") {
//     if (typeof value.error.message === "string") return value.error.message;
//   }

//   // array of errors
//   if (Array.isArray(value)) {
//     return value.join(", ");
//   }

//   // last fallback (safe stringify)
//   try {
//     return JSON.stringify(value);
//   } catch {
//     return "Something went wrong";
//   }
// };

// export const showErrorToast = (error) => {
//   const errorMsg = get_error_message(error);

//   toast.error(
//     <div className="flex  items-center justify-between">
//       <span>{errorMsg}</span>
//       {/* <button
//         onClick={() =>
//           window.open(
//             `https://stellar.expert/explorer/testnet/tx/${txHash}`,
//             "_blank"
//           )
//         }
//         className="ml-4 text-green-600 underline hover:text-green-800"
//       >
//         View in Explorer
//       </button> */}
//     </div>
//   );
// };
const get_error_message = (value) => {
  if (value == null) return "Something went wrong";

  if (typeof value === "string") return value;

  if (value instanceof Error) {
    if (value.stack) return value.stack;
    return value.message;
  }

  if (typeof value?.response?.data === "string") return value.response.data;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const showErrorToast = (error, txHash = null, network) => {
  const errorMsg = get_error_message(error);

  toast.error(
    <div className="flex max-w-[520px] items-start justify-between gap-3">
      <pre className="whitespace-pre-wrap break-words text-sm font-sans">
        {errorMsg}
      </pre>

      {txHash && network && (
        <button
          onClick={() =>
            window.open(
              `https://stellar.expert/explorer/${network?.toLowerCase()}/tx/${txHash}`,
              "_blank"
            )
          }
          className="shrink-0 text-green-600 underline hover:text-green-800"
        >
          View in Explorer
        </button>
      )}
    </div>
  );
};
