"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, UserPlus, Users, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Player } from "@/app/page"

interface PlayerFormProps {
  players: Player[]
  onAddPlayer: (name: string) => void
  onRemovePlayer: (id: string) => void
  onStartGame: () => void
}

export function PlayerForm({ players, onAddPlayer, onRemovePlayer, onStartGame }: PlayerFormProps) {
  const [playerName, setPlayerName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      onAddPlayer(playerName)
      setPlayerName("")
    }
  }

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-500" />
          Add Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="flex-1 h-11 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700"
          />
          <Button type="submit" className="h-11 px-5 bg-violet-600 hover:bg-violet-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </form>

        {players.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              Players ({players.length})
            </h3>
            <ul className="space-y-2">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md"
                >
                  <span className="text-base font-medium">{player.name}</span>
                  <button
                    onClick={() => onRemovePlayer(player.id)}
                    className="text-rose-500 hover:text-rose-700 p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    aria-label={`Remove ${player.name}`}
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4">
          <Button
            onClick={onStartGame}
            disabled={players.length < 2}
            className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            Continue to Scoring Rules
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          {players.length < 2 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">Add at least 2 players to continue</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

