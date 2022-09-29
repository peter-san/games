package petersan.games.catan

import petersan.games.catan.Color.*

fun line(edgeKey: String): Line {
    val (f, s, t) = """(\d+)([><])(\d+)""".toRegex().find(edgeKey)!!.destructured
    val from = Point(f.toInt(), t.toInt())
    val to = if (s == ">") Point(from.x + 1, from.y) else Point(from.x, from.y + 1)
    return Line(from, to)
}

fun point(pointKey: String): Point {
    val (x,y) = """(\d+):(\d+)""".toRegex().find(pointKey)!!.destructured
    return Point(x.toInt(), y.toInt())
}


fun game(vararg areaKeys: String) = Game(
    id = 1,
    state = Game.State.PLAY,
    fields = areaKeys.map { it.split(":") }.map { Area(it[0].toInt(), it[1].toInt(), null, 1) },
    players = mapOf(BLUE to Player("1"), ORANGE to Player("2")),
    harbors = emptyList(),
    moves = mutableListOf(Move(1, BLUE))
)

