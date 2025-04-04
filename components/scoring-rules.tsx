"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Medal, Settings } from "lucide-react"
import type { ScoringRule } from "@/app/page"

interface ScoringRulesProps {
  playerCount: number
  onSave: (rules: ScoringRule[]) => void
  onCancel: () => void
}

export function ScoringRules({ playerCount, onSave, onCancel }: ScoringRulesProps) {
  // Initialize with default scoring rules
  const [rules, setRules] = useState<ScoringRule[]>(
    Array.from({ length: playerCount }, (_, i) => {
      const rank = i + 1
      let points = 0

      // Default values similar to the original rules
      if (rank === 1) points = 4
      else if (rank === 2) points = 2
      else if (rank === 3) points = -2
      else points = -4

      return { rank, points }
    }),
  )

  const handlePointsChange = (rank: number, points: string) => {
    const pointsValue = Number.parseInt(points) || 0
    setRules(rules.map((rule) => (rule.rank === rank ? { ...rule, points: pointsValue } : rule)))
  }

  const handleSubmit = () => {
    onSave(rules)
  }

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings className="h-5 w-5 text-violet-500" />
          Set Scoring Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">Set the points awarded for each rank position</p>

        {rules.map((rule) => (
          <div key={rule.rank} className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor={`rank-${rule.rank}`} className="flex items-center gap-2 text-base font-medium">
              <Medal
                className={`h-5 w-5 ${
                  rule.rank === 1
                    ? "text-amber-500"
                    : rule.rank === 2
                      ? "text-gray-400"
                      : rule.rank === 3
                        ? "text-amber-700"
                        : "text-gray-300"
                }`}
              />
              <span>{getOrdinal(rule.rank)} Place</span>
            </Label>
            <Input
              id={`rank-${rule.rank}`}
              type="number"
              value={rule.points}
              onChange={(e) => handlePointsChange(rule.rank, e.target.value)}
              className={`h-11 text-base font-medium text-center ${
                rule.points > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : rule.points < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : ""
              } bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700`}
            />
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-11 text-base order-2 sm:order-1 border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="h-11 text-base order-1 sm:order-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            Save Rules
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

