package petersan.games.lambda

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse

class Handler: RequestHandler<APIGatewayProxyRequestEvent, APIGatewayV2HTTPResponse> {
    override fun handleRequest(input: APIGatewayProxyRequestEvent?, context: Context?): APIGatewayV2HTTPResponse {
        return APIGatewayV2HTTPResponse.builder().withBody("""{"type": "hallo"}""").withStatusCode(200).build()
    }

}