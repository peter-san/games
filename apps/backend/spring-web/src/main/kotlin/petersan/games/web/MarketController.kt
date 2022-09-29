package petersan.games.web

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import petersan.games.catan.*
import petersan.games.catan.model.Resources
import petersan.games.catan.core.MarketService
import java.util.UUID

@RestController
@RequestMapping("/games/catan/{id}")
class MarketController(val market: MarketService) {

    @PostMapping("/market")
    fun market(
        @PathVariable id: Int,
        @RequestBody resources: Resources,
        @AuthenticationPrincipal principal: String,
    ) = market.market(id, resources, principal)

    data class ExchangeRequest(val recipient: Color, val resources: Resources)

    @PostMapping("/exchange")
    fun exchangeResources(
        @PathVariable id: Int,
        @RequestBody exchange: ExchangeRequest,
        @AuthenticationPrincipal principal: String,
    ) = market.exchangeRequest(id, exchange.recipient, exchange.resources, principal)


    data class ExchangeResponse (val accepted: Boolean)

    @PutMapping("/exchange/{requestId}")
    fun exchangeResources(
        @PathVariable id: Int,
        @PathVariable requestId: UUID,
        @AuthenticationPrincipal principal: String,
        @RequestBody response: ExchangeResponse
    ) = market.exchangeResponse(id, requestId, principal, response.accepted)
}