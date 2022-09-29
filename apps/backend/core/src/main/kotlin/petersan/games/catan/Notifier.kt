package petersan.games.catan

interface Notifier {

    data class Update(val type: Type, val content: Game) {
        enum class Type { CREATED, UPDATED, DELETED }
    }

    fun created(game: Game)
    fun updated(game: Game)
    fun deleted(game: Game)
}