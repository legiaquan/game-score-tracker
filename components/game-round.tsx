"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, MinusCircle, Plus, Minus, Medal, Send, AlertCircle } from "lucide-react"
import type { Player, Ranking, Adjustment } from "@/app/page"
import { AlertModal } from "@/components/ui/alert-modal"

interface GameRoundProps {
  players: Player[]
  onAddRound: (rankings: Ranking[], adjustments: Adjustment[]) => void
}

export function GameRound({ players, onAddRound }: GameRoundProps) {
  const [rankings, setRankings] = useState<Record<string, number>>({})
  const [adjustments, setAdjustments] = useState<Record<string, { points: number; reason: string }>>({})
  const [showAdjustment, setShowAdjustment] = useState<Record<string, boolean>>({})
  const [showAlert, setShowAlert] = useState(false)
  const [hasDuplicateRanks, setHasDuplicateRanks] = useState(false)

  const handleRankChange = (playerId: string, rank: number) => {
    const newRankings = {
      ...rankings,
      [playerId]: rank,
    }

    setRankings(newRankings)

    // Check for duplicate ranks
    const ranks = Object.values(newRankings)
    const uniqueRanks = new Set(ranks)
    setHasDuplicateRanks(uniqueRanks.size !== ranks.length)
  }

  const handleAdjustmentChange = (playerId: string, points: number, reason: string) => {
    setAdjustments({
      ...adjustments,
      [playerId]: { points, reason },
    })
  }

  const toggleAdjustment = (playerId: string) => {
    setShowAdjustment({
      ...showAdjustment,
      [playerId]: !showAdjustment[playerId],
    })

    // Initialize adjustment if it doesn't exist
    if (!adjustments[playerId]) {
      setAdjustments({
        ...adjustments,
        [playerId]: { points: 0, reason: "" },
      })
    }
  }

  const handleSubmit = () => {
    // Check if all players have been ranked
    if (Object.keys(rankings).length !== players.length) {
      alert("Please rank all players")
      return
    }

    // Check if there are duplicate ranks
    const ranks = Object.values(rankings)
    const uniqueRanks = new Set(ranks)
    if (uniqueRanks.size !== ranks.length) {
      setShowAlert(true)
      return
    }

    // Create rankings array
    const rankingsArray: Ranking[] = Object.entries(rankings).map(([playerId, rank]) => ({
      playerId,
      rank,
    }))

    // Create adjustments array
    const adjustmentsArray: Adjustment[] = Object.entries(adjustments)
      .filter(([_, adj]) => adj.points !== 0)
      .map(([playerId, adj]) => ({
        playerId,
        points: adj.points,
        reason: adj.reason,
      }))

    onAddRound(rankingsArray, adjustmentsArray)

    // Reset form
    setRankings({})
    setAdjustments({})
    setShowAdjustment({})
  }

  return (
    <>
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Medal className="h-5 w-5 text-violet-500" />
            Round Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-5">
            {players.map((player) => (
              <div
                key={player.id}
                className="space-y-3 pb-4 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <span className="flex-1 font-medium text-base">{player.name}</span>
                  <Select
                    value={rankings[player.id]?.toString() || ""}
                    onValueChange={(value) => handleRankChange(player.id, Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-28 h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: players.length }, (_, i) => i + 1).map((rank) => (
                        <SelectItem key={rank} value={rank.toString()}>
                          {getOrdinal(rank)} Place
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pl-3">
                  {!showAdjustment[player.id] ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 text-xs h-8 border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/20"
                      onClick={() => toggleAdjustment(player.id)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Point Adjustment
                    </Button>
                  ) : (
                    <div className="space-y-3 mt-2 p-3 bg-violet-50/50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-violet-700 dark:text-violet-300">Point Adjustment:</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-100/50 dark:text-violet-400 dark:hover:bg-violet-900/20"
                          onClick={() => toggleAdjustment(player.id)}
                        >
                          <Minus className="h-3 w-3 mr-1" />
                          Hide
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={adjustments[player.id]?.points || 0}
                          onChange={(e) =>
                            handleAdjustmentChange(
                              player.id,
                              Number.parseInt(e.target.value) || 0,
                              adjustments[player.id]?.reason || "",
                            )
                          }
                          className={`w-24 text-center h-10 font-medium ${
                            (adjustments[player.id]?.points || 0) > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : (adjustments[player.id]?.points || 0) < 0
                                ? "text-rose-600 dark:text-rose-400"
                                : ""
                          } bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700`}
                        />
                        <div className="flex">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                            onClick={() =>
                              handleAdjustmentChange(
                                player.id,
                                (adjustments[player.id]?.points || 0) + 1,
                                adjustments[player.id]?.reason || "",
                              )
                            }
                          >
                            <PlusCircle className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                            onClick={() =>
                              handleAdjustmentChange(
                                player.id,
                                (adjustments[player.id]?.points || 0) - 1,
                                adjustments[player.id]?.reason || "",
                              )
                            }
                          >
                            <MinusCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        placeholder="Reason for adjustment (e.g., rule violation, fair play)"
                        value={adjustments[player.id]?.reason || ""}
                        onChange={(e) =>
                          handleAdjustmentChange(player.id, adjustments[player.id]?.points || 0, e.target.value)
                        }
                        className="h-20 text-sm bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasDuplicateRanks && (
            <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-200 dark:border-rose-800/30 mt-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">Each player must have a unique rank. Please fix duplicate rankings.</p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full mt-4 h-12 text-base bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white shadow-md hover:shadow-lg transition-all"
            disabled={Object.keys(rankings).length !== players.length}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Round
          </Button>
        </CardContent>
      </Card>

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Ranking Error"
        description="Each player must have a unique rank. Please ensure no two players have the same position."
      />
    </>
  )
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

