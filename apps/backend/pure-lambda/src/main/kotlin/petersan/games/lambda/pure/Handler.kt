package petersan.games.lambda.pure

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse
import petersan.games.web.persistence.DynamoConfiguration

class Handler : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayV2HTTPResponse> {

    private val router: (input: APIGatewayProxyRequestEvent) -> APIGatewayV2HTTPResponse

    init {
        val jackson = JacksonConfiguration().objectMapper()
        val context = CatanContext(jackson)
        println("start init")
        val repo = DynamoConfiguration(jackson).repository()
        println("repo initialized")
        val notifier = context.notifier(context.eventBridgeClient())
        println("notifier initialized")

        router = RouterConfig(
            jackson,
            context.catanService(repo, notifier),
            context.gamesService(repo, notifier),
            context.constructionService(repo, notifier),
            context.marketService(repo, notifier),
            context.cardService(repo, notifier),
        ).router()
        println("router initialized")
    }

    override fun handleRequest(input: APIGatewayProxyRequestEvent?, context: Context?): APIGatewayV2HTTPResponse {
        return router(input!!)
    }
}