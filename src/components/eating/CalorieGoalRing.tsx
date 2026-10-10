import { useTranslation } from 'react-i18next'
import GoalRing from '../common/GoalRing'
import { DEFAULT_DAILY_CALORIE_GOAL } from '../../constants/eating'

interface CalorieGoalRingProps {
  currentCalories: number
  goal: number | undefined
  onGoalChange: (goal: number | undefined) => void
}

function CalorieGoalRing({ currentCalories, goal, onGoalChange }: CalorieGoalRingProps) {
  const { t } = useTranslation()

  return (
    <div className="panel p-4 mb-4 flex justify-center">
      <GoalRing
        current={currentCalories}
        goal={goal}
        defaultGoal={DEFAULT_DAILY_CALORIE_GOAL}
        onGoalChange={onGoalChange}
        formatValue={v => v.toLocaleString()}
        color="#c4a36b"
        unit={t('eating.calorieUnit')}
        goalLabel={t('eating.goalSetAriaLabel')}
        min={100}
        max={10000}
      />
    </div>
  )
}

export default CalorieGoalRing
