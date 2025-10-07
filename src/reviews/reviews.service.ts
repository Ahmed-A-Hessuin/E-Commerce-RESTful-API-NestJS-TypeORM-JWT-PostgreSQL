import { Injectable } from "@nestjs/common";

@Injectable()
export class ReviewsService {
    public getAll() {
        return [
            { id: 1, title: 'reviews', commet: "Good" },
            { id: 2, title: 'reviews', commet: "Very Good" },
            { id: 3, title: 'reviews', comment: "excllent" }
        ]
    }
}