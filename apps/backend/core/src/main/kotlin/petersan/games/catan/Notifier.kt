package petersan.games.catan

import petersan.games.catan.Game

interface Notifier {

    data class Update(val type: Type, val content: Game) {
        enum class Type { CREATED, UPDATED, DELETED }
    }

    //@Deprecated("")
    //fun convertAndSend(path: String, game: Game)
    //fun notify(game: Game) = convertAndSend("/topic/games/catan/${game.id}", game)
    fun created(game: Game)
    fun updated(game: Game)
    fun deleted(game: Game)
}