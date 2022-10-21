package petersan.games.catan.model

import petersan.games.catan.Color
import petersan.games.catan.Game
import petersan.games.catan.Player

data class ShallowGame(
    val id: Int?,
    var state: Game.State = Game.State.INIT,
    val players: Map<Color, Player>
)