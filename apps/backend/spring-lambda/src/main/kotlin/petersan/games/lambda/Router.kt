package petersan.games.lambda

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import petersan.games.catan.core.CatanService
import petersan.games.catan.Color
import petersan.games.catan.Line
import petersan.games.catan.Point
import petersan.games.catan.core.ConstructionService
import petersan.games.catan.core.DevelopmentCardService
import petersan.games.catan.core.GamesService
import petersan.games.catan.core.MarketService
import petersan.games.catan.model.Resource
import petersan.games.catan.model.Resources
import java.util.UUID

@Configuration
class RouterConfig(
    private val jackson: ObjectMapper,
    private val catanService: CatanService,
    private val gamesService: GamesService,
    private val constructions: ConstructionService,
    private val market: MarketService,
    private val cards: DevelopmentCardService
) {

    @Bean
    fun router() = { input: APIGatewayProxyRequestEvent ->
        APIGatewayV2HTTPResponse.builder()
            .withStatusCode(200)
            .withBody(jackson.writeValueAsString(route(input)))
            .withHeaders(mapOf(
                "Content-Type" to "application/json",
                "Access-Control-Allow-Origin" to "http://localhost:3000",
                "Access-Control-Allow-Methods" to "OPTIONS,POST,GET"
            ))
            .build()
    }

    data class GameJoinRequest(val color: Color)
    data class NewGameRequest(val standard: Boolean, val color: Color)

    data class ExchangeRequest(val recipient: Color, val resources: Resources)
    data class ExchangeResponse (val accepted: Boolean)

    data class MonopoleRequest(val resource: Resource)
    data class InventionRequest(val first: Resource, val second: Resource)
    data class RoadsRequest(val first: Line, val second: Line)


    fun route(input: APIGatewayProxyRequestEvent): Any {

        fun get(path: String) = "GET /games/catan$path"
        fun post(path: String) = "POST /games/catan$path"
        fun put(path: String) = "PUT /games/catan$path"

        fun path(param: String) = input.pathParameters[param] ?: throw IllegalArgumentException("no parameter $param")
        fun id() = path("id").toInt()
        fun user() = (input.requestContext.authorizer["claims"] as Map<String,Object>)["cognito:username"] as String
        fun <T> body(clazz: Class<T>): T = jackson.readValue(input.body, clazz)


        return when (input.run { "$httpMethod $resource" }) {
            "GET /healthcheck" -> "i'm there".apply { println(this) }

            get("") -> gamesService.all()
            post("") -> body(NewGameRequest::class.java).let { gamesService.createGame(user(),it.color, it.standard)}


            get("/{id}") -> catanService.game(id())
            put("/{id}/players") -> body(GameJoinRequest::class.java).run { gamesService.joinGame(id(), user(), color)}

            post("/{id}/roll") -> catanService.roll(id(), user())
            post("/{id}/close-move") -> catanService.closeMove(id(), user())
            post("/{id}/robber") ->  body(Point::class.java).let {  catanService.moveRobber(id(), it, user())}
            post("/{id}/towns") ->  body(Point::class.java).let {  constructions.buyTown(id(), it, user())}
            post("/{id}/cities") ->  body(Point::class.java).let {  constructions.buyCity(id(), it, user())}
            post("/{id}/streets") ->  body(Line::class.java).let {  constructions.addRoad(id(), it, user())}

            post("/{id}/market") -> input.body
                .let { jackson.readValue(it, object : TypeReference<Resources>(){}) }
                .let {  market.market(id(), it, user())}
            post("/{id}/exchange") ->  body(ExchangeRequest::class.java)
                .let {  market.exchangeRequest(id(), it.recipient, it.resources, user())}
            put("/{id}/exchange/{requestId}") -> body(ExchangeResponse::class.java)
                .let {market.exchangeResponse(id(), UUID.fromString(path("requestId")), user(), it.accepted)}

            post("/{id}/cards") ->  cards.buyDevelopmentCard(id(), user())
            post("/{id}/cards/knight") ->  body(Point::class.java)
                .let{cards.useKnight(id(), user(), it)}
            post("/{id}/cards/monopole") ->  body(MonopoleRequest::class.java)
                .let{cards.playMonopole(id(), user(), it.resource)}
            post("/{id}/cards/invention") ->  body(InventionRequest::class.java)
                .let{cards.playInvention(id(), user(), it.first, it.second)}
            post("/{id}/cards/roads") ->  body(RoadsRequest::class.java)
                .let{cards.playRoads(id(), user(), it.first, it.second)}

            else -> throw IllegalArgumentException("unknown path ")
        }
    }
}