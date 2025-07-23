import { useState } from 'react';

export default function TransactionSignature({ signature }: { signature: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="text-blue-600 underline hover:text-blue-800 focus:outline-none"
        onClick={() => setOpen(true)}
        type="button"
      >
        More Details
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="font-semibold text-lg mb-2">Transaction Signature</h3>
            <div className="break-all text-sm bg-gray-100 rounded p-2 mb-4">
              {signature}
            </div>
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View on Solscan
            </a>
          </div>
        </div>
      )}
    </>
  );
}
