import { NotFoundException, ValidationException } from '@utils/errors'
import { ReactionDTO } from '../dto'
import { ReactionRepository } from '../repository'
import { ReactionService } from './reaction.service'
import { ReactionType } from '@prisma/client'
import { PostRepository } from '@domains/post/repository'

export class ReactionServiceImpl implements ReactionService {
  constructor (private readonly repository: ReactionRepository, private readonly postRepository: PostRepository) { }

  async getReactionById (reactionId: string): Promise<ReactionDTO> {
    const reaction = await this.repository.getById(reactionId)
    if (!reaction) throw new NotFoundException('reaction')
    return reaction
  }

  async getReactionsByUserAndType (userId: string, type: ReactionType): Promise<ReactionDTO[]> {
    const reactions = await this.repository.getByUserAndType(userId, type)
    if (!reactions) throw new NotFoundException('reaction')
    return reactions
  }

  async createReaction (userId: string, postId: string, type: ReactionType): Promise<ReactionDTO> {
    if (await this.doesReactionExists(userId, postId, type)) { throw new ValidationException([{ message: 'Reaction already exists' }]) }
    if (type === ReactionType.LIKE) await this.postRepository.addQtyLikes(postId)
    if (type === ReactionType.RETWEET) await this.postRepository.addQtyRetweets(postId)
    return await this.repository.create(userId, postId, type)
  }

  async deleteReaction (userId: string, postId: string, type: ReactionType): Promise<void> {
    const reaction = await this.repository.getByIdsAndType(userId, postId, type)
    if (!reaction) throw new NotFoundException('reaction')
    if (type === ReactionType.LIKE) await this.postRepository.subtractQtyLikes(postId)
    if (type === ReactionType.RETWEET) await this.postRepository.subtractQtyRetweets(postId)
    await this.repository.delete(reaction.id)
  }

  async doesReactionExists (userId: string, postId: string, type: ReactionType): Promise<boolean> {
    const reaction = await this.repository.getByIdsAndType(userId, postId, type)
    return reaction != null
  }
}
