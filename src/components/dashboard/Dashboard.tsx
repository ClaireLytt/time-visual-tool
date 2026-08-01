import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useTimeEntries } from '../../hooks/useTimeEntries'
import DatePicker from './DatePicker'
import DaySummaryCard from './DaySummaryCard'
import EntryForm from '../entries/EntryForm'
import EntryList from '../entries/EntryList'
import TimeProportionChart from '../charts/TimeProportionChart'

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const { addEntry, deleteEntry, getEntriesForDate, getSummaryForDate } = useTimeEntries()

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate), [getEntriesForDate, selectedDate])
  const daySummary = useMemo(() => getSummaryForDate(selectedDate), [getSummaryForDate, selectedDate])

  return (
    <div>
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
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
  )
}

export default Dashboard
