import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useTimeEntries } from '../../hooks/useTimeEntries'
import { CategoryProvider } from '../../contexts/CategoryContext'
import DatePicker from './DatePicker'
import DaySummaryCard from './DaySummaryCard'
import EntryForm from '../entries/EntryForm'
import EntryList from '../entries/EntryList'
import TimeProportionChart from '../charts/TimeProportionChart'
import CategoryManager from '../categories/CategoryManager'
import DataTransfer from '../settings/DataTransfer'

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [showSettings, setShowSettings] = useState(false)
  const {
    entries, categories, data,
    addEntry, deleteEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForDate,
  } = useTimeEntries()

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate), [getEntriesForDate, selectedDate])
  const daySummary = useMemo(() => getSummaryForDate(selectedDate), [getSummaryForDate, selectedDate])

  return (
    <CategoryProvider categories={categories}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <button
            onClick={() => setShowSettings(s => !s)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="设置"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {showSettings && (
          <div className="space-y-4 mb-4">
            <CategoryManager
              categories={categories}
              entries={entries}
              onAdd={addCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
            />
            <DataTransfer data={data} onImport={importData} />
          </div>
        )}

        <DaySummaryCard summary={daySummary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <EntryForm selectedDate={selectedDate} onAdd={addEntry} />
            <EntryList entries={dayEntries} onDelete={deleteEntry} />
          </div>
          <div>
            <TimeProportionChart summary={daySummary} />
          </div>
        </div>
      </div>
    </CategoryProvider>
  )
}

export default Dashboard
