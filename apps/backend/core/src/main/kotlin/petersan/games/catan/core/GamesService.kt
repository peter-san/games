package petersan.games.catan.core

import petersan.games.catan.*
import petersan.games.catan.Game.State.*
import petersan.games.catan.core.action.CloseAction
import petersan.games.catan.core.action.CreateAction
import petersan.games.catan.core.action.JoinAction
import kotlin.random.Random

/**
 * GamesService is responsible for game overview, creation and selection process
 */
class GamesService(games: GameRepository,  notifier: Notifier, random: Random = Random.Default)
    : CatanServiceBase(games, notifier, random){

    fun all() = games.findAll().toList()

    fun createGame(user: String, color: Color, random: Boolean): Game {

        return games.save(GameFactory()
            .produce(null, false, mapOf(color to user))
            .apply {
                state = CREATION
                moves.last().actions.add(CreateAction(random))
                updateAllowedActions()
            }).also {
            notifier.created(it)
        }
    }

    fun joinGame(id: Int, user: String, color: Color): Game {
        val game = find(id)

        check(!game.players.containsKey(color)) { "$color exists already" }
        check(!game.players.any { it.value.name == user }) { "$user plays already" }
        check(game.state == CREATION) { "game isn't in creation" }

        return games.save(
            game.copy(players = game.players.plus(color to Player(user)))
                .apply {
                    moves.last().actions.add(JoinAction(color))
                })
            .also {
                println("player $user joined game $id as $color")
                notifier.updated(it)
            }

    }

    fun deleteGame(id: Int, user: String) {
        val game = find(id)
        val color = getColor(game, user)

        check(game.moves.first().color === getColor(game, user)) {"user $user isn't owner"}
        games.delete(game)
        notifier.deleted(game)
    }


}