package petersan.games.web

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import petersan.games.catan.*
import petersan.games.catan.core.ConstructionService
import petersan.games.catan.core.GamesService


@RestController
@RequestMapping("/games/catan/{id}")
class ConstructionController(val games: ConstructionService) {

    @PostMapping("/towns")
    fun buyTown(@PathVariable id: Int, @RequestBody position: Point, @AuthenticationPrincipal principal: String) =
        games.buyTown(id, position, principal)

    @PostMapping("/cities")
    fun buyCity(@PathVariable id: Int, @RequestBody position: Point, @AuthenticationPrincipal principal: String) =
        games.buyCity(id, position, principal)

    @PostMapping("/streets")
    fun buyStreet(@PathVariable id: Int, @RequestBody line: Line, @AuthenticationPrincipal principal: String) =
        games.addRoad(id, line, principal)
}

