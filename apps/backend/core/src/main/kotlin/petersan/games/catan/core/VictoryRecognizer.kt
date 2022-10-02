package petersan.games.catan.core

import petersan.games.catan.Color
import petersan.games.catan.DevelopmentCard
import petersan.games.catan.Game
import petersan.games.catan.Player

class VictoryRecognizer {
    private val MAX_POINTS: Int = 10

    fun updateVictoryPoints(game: Game): Color? {
        val points = game.players.map { it.key to countPoints(it.value) }.toMap()
        var winner: Color? = null
        game.players.forEach { pl ->
            (points[pl.key] ?: 0)
                .also { if (it >= MAX_POINTS) winner = pl.key }
        }
        return winner
    }

    private fun countPoints(player: Player): Int =
        player.towns.size +
                player.cities.size * 2 +
                player.cards.count { it.type == DevelopmentCard.Type.VICTORY } +
                (if (player.longestPath != null) 2 else 0) +
                (if (player.biggestArmy) 2 else 0)

}