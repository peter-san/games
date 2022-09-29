package petersan.games.catan.model

import com.fasterxml.jackson.annotation.JsonValue

enum class Resource(@JsonValue val value: String) {
    LUMBER("lumber"),
    BRICK("brick"),
    WOOL("wool"),
    GRAIN("grain"),
    ORE("ore");
}
typealias Resources = MutableMap<Resource, Int>

fun Resources.add(resource: Resource, amount: Int) {
    this[resource] = (this[resource] ?: 0) + amount
}

// todo operators override standard library functions!!!
operator fun Resources.plusAssign(resources: Resources) = resources.forEach { (res, amount) -> this.add(res, amount) }
operator fun Resources.minusAssign(resources: Resources) = resources.forEach { (res, amount) -> this.add(res, -amount) }