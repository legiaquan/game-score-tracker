"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Edit, Clock, Info, Medal, Award, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Player, Round, ScoringRule } from "@/app/page"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface ScoreboardProps {
  players: Player[]
  rounds: Round[]
  winners: Player[]
  scoringRules: ScoringRule[]
  onEditRound: (roundId: string) => void
  onRenamePlayer: (playerId: string, newName: string) => void
}

export function Scoreboard({ players, rounds, winners, scoringRules, onEditRound, onRenamePlayer }: ScoreboardProps) {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState("")
  const [nameError, setNameError] = useState(false)

  const startRenaming = (player: Player) => {
    setEditingPlayerId(player.id)
    setEditedName(player.name)
    setNameError(false)
  }

  const cancelRenaming = () => {
    setEditingPlayerId(null)
    setEditedName("")
    setNameError(false)
  }

  const saveNewName = (playerId: string) => {
    if (editedName.trim() === "") {
      setNameError(true)
      return
    }

    onRenamePlayer(playerId, editedName)
    setEditingPlayerId(null)
    setEditedName("")
    setNameError(false)
  }

  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  // Get points for a specific rank
  const getPointsForRank = (rank: number): number => {
    const rule = scoringRules.find((r) => r.rank === rank)
    return rule ? rule.points : 0
  }

  // Calculate rank points and adjustment points separately for a player
  const calculatePlayerPointBreakdown = (playerId: string) => {
    let rankPoints = 0
    let adjustmentPoints = 0

    rounds.forEach((round) => {
      // Add rank-based points
      const playerRanking = round.rankings.find((r) => r.playerId === playerId)
      if (playerRanking) {
        rankPoints += getPointsForRank(playerRanking.rank)
      }

      // Add adjustments
      const adjustment = round.adjustments.find((a) => a.playerId === playerId)
      if (adjustment) {
        adjustmentPoints += adjustment.points
      }
    })

    return { rankPoints, adjustmentPoints }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a")
    } catch (e) {
      return "Unknown time"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-700">
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Scoreboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedPlayers.map((player, index) => {
              const { rankPoints, adjustmentPoints } = calculatePlayerPointBreakdown(player.id)
              const hasAdjustments = adjustmentPoints !== 0
              const isWinner = winners.some((w) => w.id === player.id)

              return (
                <div
                  key={player.id}
                  className={`flex items-center p-4 ${
                    isWinner
                      ? "bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : index === 1
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          : index === 2
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-900/10 dark:text-amber-600"
                            : "bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    {isWinner && <Trophy className="h-5 w-5 text-amber-500" />}
                    {editingPlayerId === player.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className={`h-8 text-sm ${nameError ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveNewName(player.id)
                            if (e.key === "Escape") cancelRenaming()
                          }}
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                            onClick={() => saveNewName(player.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                            onClick={cancelRenaming}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                          onClick={() => startRenaming(player)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    {hasAdjustments && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center mr-2">
                              <Info className="h-4 w-4 text-violet-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="text-xs">
                              <div>Rank points: {rankPoints > 0 ? `+${rankPoints}` : rankPoints}</div>
                              <div>Adjustments: {adjustmentPoints > 0 ? `+${adjustmentPoints}` : adjustmentPoints}</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-xl">{player.score}</span>
                      {hasAdjustments && (
                        <span
                          className={`text-xs ${adjustmentPoints > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                        >
                          {adjustmentPoints > 0 ? `+${adjustmentPoints}` : adjustmentPoints}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Award className="h-5 w-5 text-violet-500" />
            Scoring Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {scoringRules.map((rule) => (
              <div key={rule.rank} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Medal
                    className={`h-4 w-4 ${
                      rule.rank === 1
                        ? "text-amber-500"
                        : rule.rank === 2
                          ? "text-gray-400"
                          : rule.rank === 3
                            ? "text-amber-700"
                            : "text-gray-300"
                    }`}
                  />
                  {getOrdinal(rule.rank)} Place:
                </span>
                <span
                  className={`font-medium ${
                    rule.points > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : rule.points < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : ""
                  }`}
                >
                  {rule.points > 0 ? `+${rule.points}` : rule.points} points
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {rounds.length > 0 && (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-violet-500" />
              Round History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {rounds.map((round) => (
                <div key={round.id} className="border-b pb-6 last:border-b-0 border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-sm dark:bg-violet-900/30 dark:text-violet-400">
                        {round.number}
                      </span>
                      Round {round.number}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20"
                      onClick={() => onEditRound(round.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatTimestamp(round.timestamp)}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-violet-700 dark:text-violet-300">Rankings</h5>
                      <ul className="space-y-1 bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                        {round.rankings
                          .sort((a, b) => a.rank - b.rank)
                          .map((ranking) => {
                            const player = players.find((p) => p.id === ranking.playerId)
                            const points = getPointsForRank(ranking.rank)
                            return (
                              <li key={ranking.playerId} className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <Medal
                                    className={`h-3.5 w-3.5 ${
                                      ranking.rank === 1
                                        ? "text-amber-500"
                                        : ranking.rank === 2
                                          ? "text-gray-400"
                                          : ranking.rank === 3
                                            ? "text-amber-700"
                                            : "text-gray-300"
                                    }`}
                                  />
                                  {ranking.rank}. {player?.name}
                                </span>
                                <span
                                  className={`font-medium ${
                                    points > 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : points < 0
                                        ? "text-rose-600 dark:text-rose-400"
                                        : ""
                                  }`}
                                >
                                  {points > 0 ? `+${points}` : points}
                                </span>
                              </li>
                            )
                          })}
                      </ul>
                    </div>

                    {round.adjustments.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 text-violet-700 dark:text-violet-300">Adjustments</h5>
                        <ul className="space-y-2 bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                          {round.adjustments.map((adjustment) => {
                            const player = players.find((p) => p.id === adjustment.playerId)
                            return (
                              <li key={adjustment.playerId} className="text-sm">
                                <div className="flex justify-between">
                                  <span>{player?.name}</span>
                                  <span
                                    className={`font-medium ${
                                      adjustment.points > 0
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-rose-600 dark:text-rose-400"
                                    }`}
                                  >
                                    {adjustment.points > 0 ? `+${adjustment.points}` : adjustment.points}
                                  </span>
                                </div>
                                {adjustment.reason && (
                                  <p className="text-xs text-muted-foreground mt-1">Reason: {adjustment.reason}</p>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {winners.length > 0 && rounds.length > 0 && (
        <Card className="border-none shadow-lg bg-gradient-to-r from-amber-50 to-amber-100/70 dark:from-amber-900/30 dark:to-amber-800/20 overflow-hidden">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="absolute inset-0 rounded-full bg-amber-200 dark:bg-amber-800/50 animate-ping opacity-30"></div>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <Trophy className="h-8 w-8 text-amber-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300">
                {winners.length === 1
                  ? `Winner: ${winners[0].name}`
                  : `Tied Winners: ${winners.map((w) => w.name).join(", ")}`}
              </h3>
              <p className="text-amber-700/70 dark:text-amber-400/70 mt-1">With {winners[0].score} points</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

