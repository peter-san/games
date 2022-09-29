import { Resource } from "./Resource"

export type HarborProps  = {
    resource?: Resource,
    leftSide?: boolean
}

export class Harbor {
    public resource?: Resource
    public leftSide: boolean

    constructor({resource, leftSide}: HarborProps){
        this.resource = resource;
        this.leftSide = leftSide !== undefined ? leftSide : true
    }

}