package petersan.games.catan

interface Notifier {

    data class Update<T>(val type: Type, val content: T) {
        enum class Type { CREATED, UPDATED, DELETED }
    }

    fun created(game: Game)
    fun updated(game: Game)
    fun deleted(game: Game)
}