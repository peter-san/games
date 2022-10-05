package petersan.games.lambda

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.regions.Regions
import com.amazonaws.services.eventbridge.AmazonEventBridge
import com.fasterxml.jackson.databind.ObjectMapper
import petersan.games.catan.*
import com.amazonaws.services.eventbridge.AmazonEventBridgeClient
import com.amazonaws.services.eventbridge.model.PutEventsRequest
import com.amazonaws.services.eventbridge.model.PutEventsRequestEntry
import com.amazonaws.services.eventbridge.model.PutEventsResult
import petersan.games.catan.core.*


class CatanContext(private val jackson: ObjectMapper) {

    fun repository() = InMemoryRepository()

    fun gamesService(repository: GameRepository, notifier: Notifier) = GamesService(repository, notifier)

    fun constructionService(repository: GameRepository, notifier: Notifier) = ConstructionService(repository, notifier)

    fun catanService(repository: GameRepository, notifier: Notifier) = CatanService(repository, notifier)

    fun cardService(repository: GameRepository, notifier: Notifier) = DevelopmentCardService(repository, notifier)

    fun marketService(repository: GameRepository, notifier: Notifier) = MarketService(repository, notifier)

    fun eventBridgeClient() = AmazonEventBridgeClient.builder()
        .withRegion(Regions.EU_NORTH_1)
        .withCredentials(DefaultAWSCredentialsProviderChain())
        .build()

    data class WebsocketEvent(val path: String, val content: Any)

    fun notifier(eventBridgeClient: AmazonEventBridge) = object : Notifier {

        val path = "/topic/games/catan/"

        override fun created(game: Game) = send(game, Notifier.Update.Type.CREATED)

        override fun updated(game: Game) = send(game, Notifier.Update.Type.UPDATED)

        override fun deleted(game: Game) = send(game, Notifier.Update.Type.DELETED)

        fun send(game: Game, type: Notifier.Update.Type) {
            val requestEntry = PutEventsRequestEntry()
            requestEntry.withSource("catan-lambda-spring")
                .withDetailType("game update")
                .withDetail(jackson.writeValueAsString(WebsocketEvent(
                    path = path + game.id,
                    content = Notifier.Update(type, game))))
                .withEventBusName("catan-events")

            val request = PutEventsRequest()
            request.withEntries(requestEntry)

            val result: PutEventsResult =
                eventBridgeClient.putEvents(request) //AmazonEventBridgeClient puts the event onto the event bus
            if (result.failedEntryCount == 0)
                println("CarImportEvent for vin ${game.id} was successfully put onto event bus")
            else {
                System.err.println("Game update for ${game.id} was failing to put onto the event bus")
            }
        }

    }

}

