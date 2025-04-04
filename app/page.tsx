"use client"

import { useState, useEffect } from "react"
import { PlayerForm } from "@/components/player-form"
import { Scoreboard } from "@/components/scoreboard"
import { GameRound } from "@/components/game-round"
import { ScoringRules } from "@/components/scoring-rules"
import { EditRound } from "@/components/edit-round"
import { ConfirmModal } from "@/components/confirm-modal"
import { ClearDataButton } from "@/components/clear-data-button"
import { Trophy, Plus, BarChart3 } from "lucide-react"

export default function Home() {
  const [players, setPlayers] = useState<Player[]>(() => {
    if (typeof window !== "undefined") {
      const savedPlayers = localStorage.getItem("gamePlayers")
      return savedPlayers ? JSON.parse(savedPlayers) : []
    }
    return []
  })

  const [gameStarted, setGameStarted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedGameStarted = localStorage.getItem("gameStarted")
      return savedGameStarted ? JSON.parse(savedGameStarted) : false
    }
    return false
  })

  const [rounds, setRounds] = useState<Round[]>(() => {
    if (typeof window !== "undefined") {
      const savedRounds = localStorage.getItem("gameRounds")
      return savedRounds ? JSON.parse(savedRounds) : []
    }
    return []
  })

  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(() => {
    if (typeof window !== "undefined") {
      const savedRules = localStorage.getItem("gameScoringRules")
      return savedRules ? JSON.parse(savedRules) : []
    }
    return []
  })

  const [setupStage, setSetupStage] = useState<"players" | "scoring" | "game">(() => {
    if (typeof window !== "undefined") {
      const savedStage = localStorage.getItem("gameSetupStage")
      return savedStage ? JSON.parse(savedStage) : "players"
    }
    return "players"
  })
  const [editingRound, setEditingRound] = useState<Round | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<"round" | "scoreboard">("round")

  // Add a new player
  const addPlayer = (name: string) => {
    if (name.trim() === "") return
    setPlayers([...players, { id: Date.now().toString(), name, score: 0 }])
  }

  // Remove a player
  const removePlayer = (id: string) => {
    setPlayers(players.filter((player) => player.id !== id))
  }

  // Move to scoring setup
  const goToScoringSetup = () => {
    if (players.length < 2) return
    setSetupStage("scoring")
  }

  // Save scoring rules and start game
  const saveScoringRules = (rules: ScoringRule[]) => {
    setScoringRules(rules)
    setSetupStage("game")
    setGameStarted(true)
  }

  // Show reset confirmation
  const confirmReset = () => {
    setShowResetConfirm(true)
  }

  // Reset the game
  const resetGame = () => {
    setGameStarted(false)
    setPlayers(players.map((player) => ({ ...player, score: 0 })))
    setRounds([])
    setSetupStage("players")

    // We keep the players but clear other game data
    localStorage.removeItem("gameRounds")
    localStorage.removeItem("gameScoringRules")
    localStorage.setItem("gameStarted", JSON.stringify(false))
    localStorage.setItem("gameSetupStage", JSON.stringify("players"))
  }

  // Calculate total score for a player
  const calculatePlayerScore = (playerId: string): number => {
    let score = 0

    rounds.forEach((round) => {
      // Add rank-based points
      const playerRanking = round.rankings.find((r) => r.playerId === playerId)
      if (playerRanking) {
        score += getPointsForRank(playerRanking.rank)
      }

      // Add adjustments
      const adjustment = round.adjustments.find((a) => a.playerId === playerId)
      if (adjustment) {
        score += adjustment.points
      }
    })

    return score
  }

  // Update all player scores
  const updateAllScores = () => {
    const updatedPlayers = players.map((player) => ({
      ...player,
      score: calculatePlayerScore(player.id),
    }))

    setPlayers(updatedPlayers)
  }

  // Recalculate scores whenever rounds change
  useEffect(() => {
    updateAllScores()
  }, [rounds])

  // Save players to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("gamePlayers", JSON.stringify(players))
  }, [players])

  // Save game started state to localStorage
  useEffect(() => {
    localStorage.setItem("gameStarted", JSON.stringify(gameStarted))
  }, [gameStarted])

  // Save rounds to localStorage
  useEffect(() => {
    localStorage.setItem("gameRounds", JSON.stringify(rounds))
  }, [rounds])

  // Save scoring rules to localStorage
  useEffect(() => {
    localStorage.setItem("gameScoringRules", JSON.stringify(scoringRules))
  }, [scoringRules])

  // Save setup stage to localStorage
  useEffect(() => {
    localStorage.setItem("gameSetupStage", JSON.stringify(setupStage))
  }, [setupStage])

  // Add a new round with rankings and adjustments
  const addRound = (rankings: Ranking[], adjustments: Adjustment[]) => {
    const roundNumber = rounds.length + 1
    const newRound: Round = {
      id: roundNumber.toString(),
      number: roundNumber,
      rankings,
      adjustments,
      timestamp: new Date().toISOString(),
    }

    setRounds([...rounds, newRound])

    // Switch to scoreboard tab after adding a round on mobile
    setActiveTab("scoreboard")
  }

  // Edit an existing round
  const startEditRound = (roundId: string) => {
    const round = rounds.find((r) => r.id === roundId)
    if (round) {
      setEditingRound(round)
    }
  }

  // Save edited round
  const saveEditedRound = (editedRound: Round) => {
    const updatedRounds = rounds.map((round) => (round.id === editedRound.id ? editedRound : round))

    setRounds(updatedRounds)
    setEditingRound(null)
  }

  // Cancel round editing
  const cancelEditRound = () => {
    setEditingRound(null)
  }

  // Calculate points based on rank using custom scoring rules
  const getPointsForRank = (rank: number): number => {
    const rule = scoringRules.find((r) => r.rank === rank)
    return rule ? rule.points : 0
  }

  // Find the winner(s)
  const getWinners = () => {
    if (players.length === 0) return []

    const highestScore = Math.max(...players.map((p) => p.score))
    return players.filter((p) => p.score === highestScore)
  }

  const clearAllData = () => {
    // Clear all data from localStorage
    localStorage.removeItem("gamePlayers")
    localStorage.removeItem("gameStarted")
    localStorage.removeItem("gameRounds")
    localStorage.removeItem("gameScoringRules")
    localStorage.removeItem("gameSetupStage")

    // Reset state
    setPlayers([])
    setGameStarted(false)
    setRounds([])
    setScoringRules([])
    setSetupStage("players")
  }

  const renamePlayer = (playerId: string, newName: string) => {
    if (newName.trim() === "") return

    setPlayers(players.map((player) => (player.id === playerId ? { ...player, name: newName } : player)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-slate-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500">
              Game Score Tracker
            </span>
          </h1>
          <ClearDataButton onClearData={clearAllData} />
        </div>

        {setupStage === "players" && (
          <div className="w-full max-w-md mx-auto">
            <PlayerForm
              players={players}
              onAddPlayer={addPlayer}
              onRemovePlayer={removePlayer}
              onStartGame={goToScoringSetup}
            />
          </div>
        )}

        {setupStage === "scoring" && (
          <div className="w-full max-w-md mx-auto">
            <ScoringRules
              playerCount={players.length}
              onSave={saveScoringRules}
              onCancel={() => setSetupStage("players")}
            />
          </div>
        )}

        {setupStage === "game" && gameStarted && (
          <div>
            {/* Mobile Tabs */}
            <div className="flex md:hidden mb-6 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
              <button
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                  activeTab === "round"
                    ? "bg-violet-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("round")}
              >
                <Plus className={`h-4 w-4 ${activeTab === "round" ? "text-white" : "text-violet-500"}`} />
                <span className="font-medium">Add Round</span>
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
                  activeTab === "scoreboard"
                    ? "bg-violet-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("scoreboard")}
              >
                <BarChart3 className={`h-4 w-4 ${activeTab === "scoreboard" ? "text-white" : "text-violet-500"}`} />
                <span className="font-medium">Scoreboard</span>
              </button>
            </div>

            {/* Desktop Layout */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className={activeTab === "round" ? "block" : "hidden md:block"}>
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-violet-500" />
                  <h2 className="text-xl md:text-2xl font-bold">Add Round</h2>
                </div>
                <GameRound players={players} onAddRound={addRound} />

                <div className="mt-6">
                  <button
                    onClick={confirmReset}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-xl text-base shadow-md transition-all hover:shadow-lg"
                  >
                    Reset Game
                  </button>
                </div>
              </div>

              <div className={activeTab === "scoreboard" ? "block" : "hidden md:block"}>
                <div className="flex items-center gap-2 mb-4 md:block">
                  <BarChart3 className="h-5 w-5 text-violet-500" />
                  <h2 className="text-xl md:text-2xl font-bold">Scoreboard</h2>
                </div>
                <Scoreboard
                  players={players}
                  rounds={rounds}
                  winners={getWinners()}
                  scoringRules={scoringRules}
                  onEditRound={startEditRound}
                  onRenamePlayer={renamePlayer}
                />
              </div>
            </div>
          </div>
        )}

        {editingRound && (
          <EditRound round={editingRound} players={players} onSave={saveEditedRound} onCancel={cancelEditRound} />
        )}

        <ConfirmModal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={resetGame}
          title="Reset Game"
          description="Are you sure you want to reset the game? All rounds and scores will be lost, but player names will be kept."
          confirmText="Yes, reset game"
          cancelText="No, keep playing"
        />
      </main>
    </div>
  )
}

// Types
export interface Player {
  id: string
  name: string
  score: number
}

export interface Ranking {
  playerId: string
  rank: number
}

export interface Adjustment {
  playerId: string
  points: number
  reason: string
}

export interface Round {
  id: string
  number: number
  rankings: Ranking[]
  adjustments: Adjustment[]
  timestamp: string
}

export interface ScoringRule {
  rank: number
  points: number
}

