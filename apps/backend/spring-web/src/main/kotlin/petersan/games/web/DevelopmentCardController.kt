package petersan.games.web

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import petersan.games.catan.Line
import petersan.games.catan.Point
import petersan.games.catan.model.Resource
import petersan.games.catan.core.DevelopmentCardService

@RestController
@RequestMapping("/games/catan/{id}/cards")
class DevelopmentCardController(val cards: DevelopmentCardService) {
    @PostMapping
    fun buyCard(@PathVariable id: Int, @AuthenticationPrincipal principal: String) = cards.buyDevelopmentCard(id, principal)

    @PostMapping("/knight")
    fun playKnight(@PathVariable id: Int, @RequestBody position: Point, @AuthenticationPrincipal principal: String) =
        cards.useKnight(id, principal,position)

    data class MonopoleRequest(val resource: Resource)

    @PostMapping("/monopole")
    fun playMonopole(@PathVariable id: Int, @RequestBody request: MonopoleRequest, @AuthenticationPrincipal principal: String) =
        cards.playMonopole(id, principal, request.resource)

    data class InventionRequest(val first: Resource, val second: Resource)

    @PostMapping("/invention")
    fun playInvention(@PathVariable id: Int, @RequestBody request: InventionRequest, @AuthenticationPrincipal principal: String) =
        cards.playInvention(id, principal, request.first, request.second)

    data class RoadsRequest(val first: Line, val second: Line)

    @PostMapping("/roads")
    fun playRoads(@PathVariable id: Int, @RequestBody request: RoadsRequest, @AuthenticationPrincipal principal: String) =
        cards.playRoads(id, principal, request.first, request.second)
}