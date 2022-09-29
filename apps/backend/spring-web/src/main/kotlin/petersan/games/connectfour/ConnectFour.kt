package petersan.games.connectfour

import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import kotlin.random.Random


data class ConnectFour(
    val id: Int,
    val owner: String,
    var status: Status = Status.CREATED,
    val moves: MutableList<Int> = mutableListOf(),
) {
    var guest: String? = null

    enum class Status {
        CREATED, STARTED, FINISHED
    }
}

@Service
class ConnectFourService(val template: SimpMessagingTemplate) {
    private val games = listOf<ConnectFour>(
        ConnectFour(1, "1"),
        ConnectFour(2, "2"),
        ConnectFour(3, "2")
    )
        //.map { it.apply { status = ConnectFour.Status.FINISHED } }
        .associateBy(ConnectFour::id).toMutableMap()

    val random = Random

    fun create(owner: String): ConnectFour {
        val game = ConnectFour(random.nextInt(100), owner)
        games[game.id] = game
        template.convertAndSend("/topic/games/${game.id}", game)
        return game
    }

    fun game(id: Int): ConnectFour = games[id]
        .also { println("fetched game: $id") }
        ?: throw Exception("unknown game")

    fun games() = games.values.also { println("fetched all games") }

    fun startGame(id: Int, guest: String): ConnectFour {
        val game = game(id)

        if (game.status != ConnectFour.Status.CREATED) {
            throw Exception("can not start game $id")
        }

        if (game.owner == guest) {
            throw Exception("owner shouldn't be guest")
        }

        game.guest = guest
        game.status = ConnectFour.Status.STARTED
        template.convertAndSend("/topic/games/$id", game)
        return game
    }

    fun makeMove(id: Int, player: String, position: Int): ConnectFour {
        val game = game(id)

        if (game.status != ConnectFour.Status.STARTED) {
            throw Exception("can not move $id")
        }

        if (player == game.owner) {
            if (game.moves.size % 2 == 1) {
                throw Exception("not your turn, $player")
            }
        } else if (player == game.guest) {
            if (game.moves.size % 2 == 0) {
                throw Exception("not your turn, $player")
            }
        } else {
            throw Exception("who are you, $player?")
        }

        game.moves.add(position)
        template.convertAndSend("/topic/games/$id", game)
        //TODO check finished

        return game
    }
}

@RestController
@RequestMapping("/games/connect-four")
class GamesController(val games: ConnectFourService) {

    @GetMapping
    fun games() = games.games()

    @PostMapping
    fun createGame(@AuthenticationPrincipal principal: String) = games.create(principal)
}

@RestController
@RequestMapping("/games/connect-four/{id}")
class GameController(val games: ConnectFourService) {

    @GetMapping
    fun game(@PathVariable id: Int) = games.game(id)

    @PutMapping("guest")
    fun join(
        @PathVariable id: Int,
        @AuthenticationPrincipal principal: String,
    ): ConnectFour {
        val game = games.startGame(id, principal);
        println("$principal joined game $id")
        return game;
    }

    @PostMapping("{position}")
    fun move(
        @PathVariable id: Int,
        @PathVariable("position") position: Int,
        @AuthenticationPrincipal principal: String,
    ): ConnectFour {
        return games.makeMove(id, principal, position);
    }
}
