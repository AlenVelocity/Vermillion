import { Request } from 'express'

export default class APIfeatures {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    constructor(public query: any, public queryString: Request['query']) {}

    paginating = (): APIfeatures => {
        const page = ((this?.queryString?.page as unknown as number) || 1) * 1 || 1
        const limit = ((this?.queryString?.limit as unknown as number) || 1) * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this
    }
}
