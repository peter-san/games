export enum Resource {
    LUMBER = 'lumber', BRICK = 'brick', WOOL = 'wool', ORE = 'ore', GRAIN = 'grain'
}

export type Resources = Map<Resource, number>

export namespace Resource {

    export const values = (): Resource[] => [Resource.LUMBER, Resource.BRICK, Resource.WOOL, Resource.ORE, Resource.GRAIN]

    export const batch = (props: {
        lumber?: number,
        brick?: number,
        wool?: number,
        grain?: number,
        ore?: number
    }): Resources => {
        const map: Resources = new Map();

        if (props.lumber) map.set(Resource.LUMBER, props.lumber)
        if (props.brick) map.set(Resource.BRICK, props.brick)
        if (props.wool) map.set(Resource.WOOL, props.wool)
        if (props.ore) map.set(Resource.ORE, props.ore)
        if (props.grain) map.set(Resource.GRAIN, props.grain)

        return map;
    }

    export const enough = (resources: Resources, costs: Resources):boolean => {
        return Array.from(costs.entries()).every(([type, cost]) => (resources.get(type) || false) >= cost)
    } 
}
