export class FollowerDTO {
  constructor (follow: FollowerDTO) {
    this.id = follow.id
    this.followerId = follow.followerId
    this.followedId = follow.followedId
    this.createdAt = follow.createdAt
  }

  id: string
  followerId: string
  followedId: string
  createdAt: Date
}

