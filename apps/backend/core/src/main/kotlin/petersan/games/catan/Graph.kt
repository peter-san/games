package petersan.games.catan


class Node(val key: String, var content: Color? = null, var city: Boolean = false, var edges: List<Edge> = emptyList()) {
    fun neighbours(): List<Node> = edges.map { if (it.from == this) it.to else it.from }
}

class Edge(val key: String, val from: Node, val to: Node, var content: Color? = null) {

    fun neighbours(node: Node) = node.edges.filter { it != this }

    fun fromNeighbours() = neighbours(from)
    fun toNeighbours() = neighbours(to)
}

class Graph(val edges: Map<String, Edge>, val nodes: Map<String, Node>) {

}

class GraphConstructor() {

    private fun nodeKey(x: Int, y: Int) = "$x:$y"

    fun construct(game: Game): Graph {

        val edges = mutableMapOf<String, Edge>()
        val nodes = mutableMapOf<String, Node>()

        game.fields.forEach {
            for (i in 0..5) {
                val x = it.x + i % 3
                val y = it.y + (if (i > 2) 1 else 0)
                val key = nodeKey(x, y)
                nodes[key] = Node(key)
            }
        }

        fun addEdge(area: Area, dX: Int, dY: Int, horizontal: Boolean) {

            val x = area.x + dX
            val y = area.y + dY

            val from: Node = nodes[nodeKey(x, y)]!!
            val to: Node = nodes[nodeKey(
                if (horizontal) x + 1 else x,
                if (horizontal) y else y + 1)]!!

            edges.computeIfAbsent("$x${if (horizontal) ">" else "<"}$y") {
                Edge(it, from, to).apply {
                    from.edges += this
                    to.edges += this
                }
            }
        }

        game.fields.forEach {
            addEdge(it, 0, 0, true)
            addEdge(it, 1, 0, true)
            addEdge(it, 2, 0, false)
            addEdge(it, 0, 1, true)
            addEdge(it, 1, 1, true)
            addEdge(it, 0, 0, false)
        }

        game.players.entries.forEach { (c, u) ->
            u.towns.forEach { nodes[nodeKey(it.x, it.y)]!!.content=c }
            u.cities.forEach { nodes[nodeKey(it.x, it.y)]!!.apply { content = c; city = true }}
            u.roads.forEach { edges[it.edgeKey()]!!.content=c }
        }

        return Graph(edges, nodes);
    }
}

