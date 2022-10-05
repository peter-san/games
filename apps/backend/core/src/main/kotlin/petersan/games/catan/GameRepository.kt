package petersan.games.catan

import petersan.games.catan.model.Resource

interface GameRepository {
    fun findAll(): List<Game>
    fun find(id: Int): Game?


    fun save(game: Game): Game

    fun delete(game: Game)

}

class InMemoryRepository : GameRepository {
    private val games = listOf(
        GameFactory().produce(0),
        GameFactory().produce(1, true, mapOf(Color.RED to "1")).apply {
            player(Color.RED).cards += DevelopmentCard(DevelopmentCard.Type.KNIGHT, false)
            player(Color.RED).cards += DevelopmentCard(DevelopmentCard.Type.KNIGHT, false)
            player(Color.RED).cards += DevelopmentCard(DevelopmentCard.Type.KNIGHT, false)
            player(Color.RED).cards += DevelopmentCard(DevelopmentCard.Type.INVENTION, false)
            player(Color.RED).cards += DevelopmentCard(DevelopmentCard.Type.INVENTION, false)
            player(Color.RED).cards += DevelopmentCard(DevelopmentCard.Type.MONOPOLE, false)
            player(Color.RED).cards += DevelopmentCard(DevelopmentCard.Type.VICTORY, false)
            player(Color.RED).cards += DevelopmentCard(DevelopmentCard.Type.ROADS, false)


            player(Color.RED).resources += mutableMapOf(
                Resource.ORE to 10,
                Resource.WOOL to 10,
                Resource.GRAIN to 10,
                Resource.LUMBER to 10,
                Resource.BRICK to 10)

            //state = Game.State.CREATION
            updateAllowedActions()
            //
        },
        GameFactory().produce(2)
    ).associateBy { it.id!! }.toMutableMap()

    override fun findAll() = games.values.toList() // todo shallow items

    override fun find(id: Int) = games[id] //GameFactory().produce(0)

    override fun save(original: Game): Game {
        val game = if (original.id != null) {
            original
        } else {
            original.copy(id = (games.keys.maxOrNull() ?: -1) + 1)
        }

        games[game.id!!] = game
        return game
    }

    override fun delete(game: Game) {
        games.remove(game.id)
    }

}