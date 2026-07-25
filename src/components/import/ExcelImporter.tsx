import { useRef } from "react";

type Props = {
  onSelect: (file: File) => void;
};

export default function ExcelImporter({ onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            onSelect(file);
          }
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="bg-white text-green-900 px-5 py-3 rounded-xl font-semibold"
      >
        📄 Importar Excel
      </button>
    </>
  );
}