package petersan.games.web

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import petersan.games.catan.*
import petersan.games.catan.core.GamesService

data class GameRequest(val standard: Boolean = true, val players: Map<Color, String>)

data class GameJoinRequest(val color: Color)
data class NewGameRequest(val standard: Boolean = true, val color: Color)
data class GameStartRequest(val state: Game.State)

@RestController
@RequestMapping("/games/catan")
class CatanGamesController(val games: GamesService) {
    @GetMapping
    fun game() = games.all()

    @PostMapping
    fun createGame(@RequestBody request: NewGameRequest,@AuthenticationPrincipal principal: String) =
        games.createGame(principal, request.color, request.standard)


    @PutMapping("/{id}/players")
    fun joinGame(@PathVariable id: Int,@RequestBody request: GameJoinRequest,@AuthenticationPrincipal principal: String)
        = games.joinGame(id, principal, request.color)

    @DeleteMapping("/{id}")
    fun deleteGame(@PathVariable id: Int,@AuthenticationPrincipal principal: String) = games.deleteGame(id, principal)
}

@RestController
@RequestMapping("/games/catan/{id}")
class CatanController(val games: CatanService) {

    @GetMapping
    fun game(@PathVariable id: Int, @RequestHeader headers: Map<String, String>): Game {
        println(headers)
        return games.game(id)
    }

    @PutMapping
    fun replace(@PathVariable id: Int, @RequestBody request: GameRequest, @RequestHeader headers: Map<String, String>): Game {
        return games.create(id, request.standard, request.players)
    }

    @PostMapping("/roll")
    fun roll(@PathVariable id: Int, @AuthenticationPrincipal principal: String, @RequestHeader headers: Map<String, String>): Game {
        return games.roll(id, principal)
    }

    @PostMapping("/close-move")
    fun close(@PathVariable id: Int, @AuthenticationPrincipal principal: String) = games.closeMove(id, principal)


    @PostMapping("/robber")
    fun moveRobber(@PathVariable id: Int, @RequestBody position: Point, @AuthenticationPrincipal principal: String) =
        games.moveRobber(id, position, principal)
}

