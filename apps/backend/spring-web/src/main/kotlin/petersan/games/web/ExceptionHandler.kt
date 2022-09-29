package petersan.games.web

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler
import petersan.games.catan.core.action.CatanValidationException


@ControllerAdvice
class RestResponseEntityExceptionHandler : ResponseEntityExceptionHandler() {
    @ExceptionHandler(value = [CatanValidationException::class])
    protected fun handleConflict(
        ex: CatanValidationException, request: WebRequest?,
    ): ResponseEntity<Any> {
        val status = HttpStatus.valueOf(ex.status.code)

        return handleExceptionInternal(ex, ex,
            HttpHeaders(), HttpStatus.valueOf(ex.status.code), request!!)
    }

    data class Response(val message: String, val status: Int, val timestamp: Long)
}