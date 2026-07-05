import React, { useRef } from 'react';
import type { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export interface MerchantExcelRow {
  商家名称: string;
  品类: string;
  联系人: string;
  联系电话: string;
  地址: string;
  月销售额: number;
  接通率: number;
  意向等级: string;
}

export function exportMerchantsToExcel(data: MerchantExcelRow[], filename = '商家列表') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '商家数据');
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '').replace('-', '');
  XLSX.writeFile(wb, `${filename}_${ts}.xlsx`);
  toast.success(`已导出 ${data.length} 条商家数据`);
}

interface ImportButtonProps {
  onImport: (rows: MerchantExcelRow[]) => void;
  className?: string;
  label?: string;
}

export function ExcelImportButton({ onImport, className, label = '导入 Excel' }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<MerchantExcelRow>(ws);
        if (rows.length === 0) {
          toast.error('文件内容为空，请检查格式');
          return;
        }
        onImport(rows);
        toast.success(`成功导入 ${rows.length} 条商家数据`);
      } catch {
        toast.error('文件格式错误，请上传标准 Excel 文件');
      }
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
      <button
        className={className}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </button>
    </>
  );
}
