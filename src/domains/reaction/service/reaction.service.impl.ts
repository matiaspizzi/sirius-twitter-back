import { NotFoundException, ValidationException } from '@utils/errors'
import { ReactionDTO } from '../dto'
import { ReactionRepository } from '../repository'
import { ReactionService } from './reaction.service'
import { ReactionType } from '@prisma/client'
import { PostRepositoryImpl } from '@domains/post/repository'
import { db } from '@utils'

const PostRepository = new PostRepositoryImpl(db)

export class ReactionServiceImpl implements ReactionService {
  constructor (private readonly repository: ReactionRepository) {}

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
    if (await this.doesReactionExist(userId, postId, type)) throw new ValidationException([{ message: 'Reaction already exists' }])
    if (type === ReactionType.LIKE) await PostRepository.addQtyLikes(postId)
    if (type === ReactionType.RETWEET) await PostRepository.addQtyRetweets(postId)
    return await this.repository.create(userId, postId, type)
  }

  async deleteReaction (userId: string, postId: string, type: ReactionType): Promise<void> {
    const reaction = await this.repository.getByIdsAndType(userId, postId, type)
    if (!reaction) throw new NotFoundException('reaction')
    if (type === ReactionType.LIKE) await PostRepository.subtractQtyLikes(postId)
    if (type === ReactionType.RETWEET) await PostRepository.subtractQtyRetweets(postId)
    await this.repository.delete(reaction.id)
  }

  async doesReactionExist (userId: string, postId: string, type: ReactionType): Promise<boolean> {
    const reaction = await this.repository.getByIdsAndType(userId, postId, type)
    return (reaction != null)
  }
}
