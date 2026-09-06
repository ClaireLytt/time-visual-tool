import { useRef, useState } from 'react'
import type { StorageData } from '../../types'
import { exportToFile, readImportFile } from '../../utils/dataTransfer'
import ConfirmDialog from '../common/ConfirmDialog'

interface DataTransferProps {
  data: StorageData
  onImport: (data: StorageData, mode: 'replace' | 'merge') => void
}

function DataTransfer({ data, onImport }: DataTransferProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<StorageData | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const imported = await readImportFile(file)
      setPending(imported)
      setStatus(null)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : '导入失败' })
    }
  }

  const handleImport = (mode: 'replace' | 'merge') => {
    if (!pending) return
    onImport(pending, mode)
    setPending(null)
    setStatus({ type: 'success', message: mode === 'replace' ? '数据已覆盖导入' : '数据已合并导入' })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">数据管理</h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-2">将所有数据导出为 JSON 文件</p>
          <button
            onClick={() => exportToFile(data)}
            className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            导出数据
          </button>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2">从 JSON 文件导入数据</p>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
          >
            导入数据
          </button>
        </div>

        {status && (
          <p className={`text-xs ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {status.message}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="选择导入方式"
        message={`文件包含 ${pending?.entries.length ?? 0} 条记录和 ${pending?.categories.length ?? 0} 个分类。请选择导入方式：`}
        confirmLabel="覆盖导入"
        cancelLabel="合并导入"
        confirmVariant="danger"
        onConfirm={() => handleImport('replace')}
        onCancel={() => handleImport('merge')}
      />
    </div>
  )
}

export default DataTransfer
