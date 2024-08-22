import mongodb from "mongodb"
const ObjectId = mongodb.ObjectId

let reviews
export default class ReviewsDAO {
    static async injectDB(conn) {
        if (reviews) {
            return
        } try {
            reviews = await conn.db(process.env.MOVIEREVIEWS_NS).collection('reviews')
        } catch (e) {
            console.error(`unable to establish connection handle in reviewDAO: ${e}`)
        }
    }
    static async addReview(movieId, user, review, date) {
        try {
            const reviewDoc = {
                name: user.name,
                user_id: user._id,
                date: date,
                review: review,
                movie_id: new ObjectId(movieId)
            }
            return await reviews.insertOne(reviewDoc)
        } catch (e) {
            console.error(`unable to post review: ${e}`)
            console.error(e)
            return { error: e }
        }
    }

    static async updateReview(reviewId, userId, review, date) {
        try {
            const updateResponse = await reviews.updateOne(
                { user_id: userId, _id: new ObjectId(reviewId) },
                { $set: { review: review, date: date } }
            )
            return updateResponse
        } catch (e) {
            console.error(`unable to update review: ${e}`)
            console.error(e)
            return { error: e }
        }
    }

    static async apiDeleteReview(req, res, next) {
        try {
            const reviewId = req.body.review_id
            const userId = req.body.user_id
            const ReviewResponse = await ReviewsDAO.deleteReview(
                reviewId,
                userId,
            )
            res.json(ReviewResponse)
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    }

    static async deleteReview(reviewId, userId) {
        try {
            const deleteResponse = await reviews.deleteOne({
                _id: new ObjectId(reviewId),
                user_id: userId,
            })
            return deleteResponse
        } catch (e) {
            console.error(`unable to delete review: ${e}`)
            console.error(e)
            return { error: e.message }
        }
    }

}
