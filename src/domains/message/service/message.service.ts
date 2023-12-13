import { UserViewDTO } from '@domains/user/dto'
import { MessageDTO } from '../dto'

export interface MessageService {
  newMessage: (userId: string, to: string, content: string) => Promise<MessageDTO>
  getChats: (userId: string) => Promise<UserViewDTO[]>
  getChat: (user1Id: string, user2Id: string) => Promise<MessageDTO[] | Boolean>
}
